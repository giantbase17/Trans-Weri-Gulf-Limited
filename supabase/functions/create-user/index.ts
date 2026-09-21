// Supabase Edge Function: direct admin-created user accounts.
//
// The admin sets the new user's email, password and role right in the
// dashboard. The account is created already confirmed — no Supabase
// verification email, no invite link, no separate password-setup step.
// The new user can sign in immediately with the credentials the admin gave
// them.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (both already
// set on this project). BREVO_API_KEY / BREVO_SENDER_EMAIL / BREVO_SENDER_NAME
// are optional — when present, a best-effort "your account is ready" email
// is sent, but its failure never fails account creation.
//
// Deploy with: supabase functions deploy create-user
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_ROLES = [
  "admin",
  "manager",
  "staff",
  "super_admin",
  "sales_manager",
  "equipment_manager",
];

interface CreateUserPayload {
  email: string;
  password: string;
  fullName?: string;
  role: string;
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

    const { data: callerRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .in("role", ["admin", "super_admin"]);
    if (!callerRoles || callerRoles.length === 0) {
      return json({ error: "Only admins can create users" }, 403);
    }
    const callerIsSuperAdmin = callerRoles.some((r) => r.role === "super_admin");

    const payload = (await req.json()) as CreateUserPayload;
    if (!payload.email || !payload.password || !payload.role) {
      return json({ error: "email, password and role are required" }, 400);
    }
    if (payload.password.length < 8) {
      return json(
        { error: "Password must be at least 8 characters" },
        400,
      );
    }
    if (!VALID_ROLES.includes(payload.role)) {
      return json({ error: "Invalid role" }, 400);
    }
    if (payload.role === "super_admin" && !callerIsSuperAdmin) {
      return json(
        { error: "Only a super admin can create a super admin account" },
        403,
      );
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: { full_name: payload.fullName ?? "" },
      });

    if (createError || !created?.user) {
      return json(
        { error: createError?.message ?? "Could not create account" },
        400,
      );
    }

    const newUserId = created.user.id;

    const { error: roleError } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: payload.role });

    if (roleError) {
      // Don't leave a roleless orphan account behind.
      await admin.auth.admin.deleteUser(newUserId);
      return json(
        { error: `Could not assign role, account rolled back: ${roleError.message}` },
        500,
      );
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
    const senderName =
      Deno.env.get("BREVO_SENDER_NAME") ?? "Trans Weri Gulf Limited";

    if (brevoApiKey && senderEmail) {
      const greetingName = payload.fullName?.trim() || "there";
      const html = renderWelcomeEmail({
        greetingName,
        role: payload.role,
        email: payload.email,
        senderName,
      });

      try {
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
            subject: `Your ${senderName} account is ready`,
            htmlContent: html,
          }),
        });
        if (!brevoRes.ok) {
          console.error("Brevo send failed:", brevoRes.status, await brevoRes.text());
        }
      } catch (emailError) {
        // The account already exists and is fully usable — a notification
        // email is a nice-to-have, never a reason to report failure.
        console.error("Brevo request error:", emailError);
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("create-user error:", error);
    return json({ error: "Unexpected error creating account" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function renderWelcomeEmail(opts: {
  greetingName: string;
  role: string;
  email: string;
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
                  An administrator has created your ${opts.senderName} fleet operations account with the <strong>${opts.role}</strong> role.
                </p>
                <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 8px;">
                  Sign in with:
                </p>
                <p style="font-size:14px;color:#152a54;line-height:1.6;margin:0 0 24px;font-weight:bold;">
                  ${opts.email}
                </p>
                <p style="font-size:13px;color:#666;line-height:1.6;margin:0;">
                  Use the password your administrator shared with you separately.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
