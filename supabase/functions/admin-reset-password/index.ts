// Supabase Edge Function: lets an admin/super_admin set a new password for
// another admin-dashboard user. supabase-js has no client-callable "set
// this other user's password" API — it requires the Auth Admin API, which
// needs the service role key, hence an edge function (same shape as
// create-user).
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already set on
// this project).
//
// Deploy with: supabase functions deploy admin-reset-password
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordPayload {
  targetUserId: string;
  newPassword: string;
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
      return json({ error: "Only admins can reset passwords" }, 403);
    }
    const callerIsSuperAdmin = callerRoles.some((r) => r.role === "super_admin");

    const payload = (await req.json()) as ResetPasswordPayload;
    if (!payload.targetUserId || !payload.newPassword) {
      return json({ error: "targetUserId and newPassword are required" }, 400);
    }
    if (payload.newPassword.length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Same rule as admin_assign_role/admin_remove_role/admin_delete_user:
    // an admin (not super_admin) can't act on a super_admin account, and
    // gets the same "not found" an admin would see for a nonexistent user
    // rather than a message that reveals the account exists.
    if (!callerIsSuperAdmin) {
      const { data: targetRoles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", payload.targetUserId)
        .eq("role", "super_admin");
      if (targetRoles && targetRoles.length > 0) {
        return json({ error: "User not found" }, 404);
      }
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      payload.targetUserId,
      { password: payload.newPassword },
    );
    if (updateError) {
      return json({ error: updateError.message }, 400);
    }

    return json({ success: true });
  } catch (error) {
    console.error("admin-reset-password error:", error);
    return json({ error: "Unexpected error resetting password" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
