// Supabase Edge Function: invite-only user creation.
//
// Creates the auth user (unconfirmed), assigns their role, and emails a
// branded invite via Brevo containing a one-time link that lets them set
// their own password. The admin never sees or sets the new user's password.
//
// Required secrets (already set for send-invitation-email, reused here):
//   BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
//
// Deploy with: supabase functions deploy invite-user
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_ROLES = ["admin", "manager", "staff"];

interface InvitePayload {
  email: string;
  fullName?: string;
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
      return json({ error: "Only admins can invite users" }, 403);
    }

    const payload = (await req.json()) as InvitePayload;
    if (!payload.email || !payload.role) {
      return json({ error: "email and role are required" }, 400);
    }
    if (!VALID_ROLES.includes(payload.role)) {
      return json({ error: "Invalid role" }, 400);
    }

    const redirectTo = `${payload.siteUrl.replace(/\/$/, "")}/set-password`;

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "invite",
        email: payload.email,
        options: {
          data: { full_name: payload.fullName ?? "" },
          redirectTo,
        },
      });

    if (linkError || !linkData?.user) {
      return json({ error: linkError?.message ?? "Could not create invite" }, 400);
    }

    const newUserId = linkData.user.id;
    const actionLink = linkData.properties?.action_link;

    const { error: roleError } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: payload.role });

    if (roleError) {
      // Don't leave a roleless orphan account behind.
      await admin.auth.admin.deleteUser(newUserId);
      return json(
        { error: `Could not assign role, invite cancelled: ${roleError.message}` },
        500,
      );
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
    const senderName =
      Deno.env.get("BREVO_SENDER_NAME") ?? "Trans Weri Gulf Limited";

    if (!brevoApiKey || !senderEmail || !actionLink) {
      return json(
        {
          error:
            "User created and role assigned, but the invite email could not be sent (Brevo is not configured).",
        },
        502,
      );
    }

    const greetingName = payload.fullName?.trim() || "there";
    const html = renderInviteEmail({
      greetingName,
      role: payload.role,
      actionLink,
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
        subject: `You've been invited to ${senderName}`,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const detail = await brevoRes.text();
      console.error("Brevo send failed:", brevoRes.status, detail);
      return json(
        {
          error:
            "User created and role assigned, but the invite email failed to send via Brevo.",
        },
        502,
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("invite-user error:", error);
    return json({ error: "Unexpected error creating invite" }, 500);
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
  role: string;
  actionLink: string;
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
                <h1 style="font-size:20px;color:#152a54;margin:0 0 16px;">You're invited, ${opts.greetingName}</h1>
                <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 16px;">
                  You've been invited to join the ${opts.senderName} fleet operations portal with the <strong>${opts.role}</strong> role.
                </p>
                <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 24px;">
                  Click below to set your password and get started. This link is valid for a limited time.
                </p>
                <a href="${opts.actionLink}" style="display:inline-block;background:#e5541a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:8px;">
                  Set your password
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
