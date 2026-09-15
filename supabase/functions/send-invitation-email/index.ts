// Supabase Edge Function: sends a staff-invitation email via Brevo.
//
// Required secrets (set with `supabase secrets set`):
//   BREVO_API_KEY      - Brevo transactional API key
//   BREVO_SENDER_EMAIL - a sender address verified in Brevo
//   BREVO_SENDER_NAME  - display name for the sender, e.g. "Trans Weri Gulf Limited"
//
// Deploy with: supabase functions deploy send-invitation-email
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitePayload {
  userId: string;
  email: string;
  fullName?: string;
  tempPassword: string;
  role: string;
  siteUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Identify the caller from their JWT and confirm they are an admin —
    // this function runs with the service role, so it must gate itself.
    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: callerError,
    } = await admin.auth.getUser(jwt);
    if (callerError || !caller) {
      return json({ error: "Invalid session" }, 401);
    }

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!callerRole) {
      return json({ error: "Only admins can send invitations" }, 403);
    }

    const payload = (await req.json()) as InvitePayload;
    if (!payload.email || !payload.tempPassword || !payload.userId) {
      return json({ error: "email, tempPassword and userId are required" }, 400);
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
    const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "Trans Weri Gulf Limited";
    if (!brevoApiKey || !senderEmail) {
      return json({ error: "Brevo is not configured on the server" }, 500);
    }

    const loginUrl = `${payload.siteUrl.replace(/\/$/, "")}/admin`;
    const greetingName = payload.fullName?.trim() || "there";

    const html = renderInviteEmail({
      greetingName,
      email: payload.email,
      tempPassword: payload.tempPassword,
      role: payload.role,
      loginUrl,
      senderName,
    });

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: payload.email, name: greetingName }],
        subject: `Your ${senderName} staff account`,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const detail = await brevoRes.text();
      console.error("Brevo send failed:", brevoRes.status, detail);
      return json({ error: "Failed to send email via Brevo" }, 502);
    }

    // Best-effort audit record; failure here shouldn't fail the request
    // since the email has already been sent.
    await admin.from("user_invitations").insert({
      user_id: payload.userId,
      invited_by: caller.id,
      invitation_email: payload.email,
      invitation_password: payload.tempPassword,
      invitation_sent_at: new Date().toISOString(),
    });

    return json({ success: true });
  } catch (error) {
    console.error("send-invitation-email error:", error);
    return json({ error: "Unexpected error sending invitation" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function renderInviteEmail(opts: {
  greetingName: string;
  email: string;
  tempPassword: string;
  role: string;
  loginUrl: string;
  senderName: string;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#152a54;padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">${opts.senderName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-size:20px;color:#152a54;margin:0 0 16px;">Welcome, ${opts.greetingName}</h1>
                <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 16px;">
                  An account has been created for you on the ${opts.senderName} fleet operations portal, with the <strong>${opts.role}</strong> role.
                </p>
                <table cellpadding="8" cellspacing="0" style="background:#f4f6f8;border-radius:8px;width:100%;margin:0 0 16px;">
                  <tr>
                    <td style="font-size:13px;color:#555;">Email</td>
                    <td style="font-size:13px;color:#152a54;font-weight:bold;">${opts.email}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#555;">Temporary password</td>
                    <td style="font-size:13px;color:#152a54;font-weight:bold;">${opts.tempPassword}</td>
                  </tr>
                </table>
                <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 16px;">
                  You will also receive a separate confirmation email from us — please confirm your address first, then sign in and change your password.
                </p>
                <a href="${opts.loginUrl}" style="display:inline-block;background:#e5541a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:8px;">
                  Sign in to the portal
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
