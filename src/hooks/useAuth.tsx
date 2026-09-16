import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles } from "@/lib/db";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        setRoles([]);
        setRolesLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setSessionLoading(false);
      if (!data.session?.user) setRolesLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setRolesLoading(true);
    fetchMyRoles(user.id)
      .then((r) => {
        if (active) setRoles(r);
      })
      .catch(() => {
        if (active) setRoles([]);
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return {
    session,
    user,
    roles,
    // Loading until we know both whether there's a session AND, if there
    // is, what roles it has — otherwise a legitimate staff/manager account
    // briefly renders as "access denied" while roles are still in flight.
    loading: sessionLoading || rolesLoading,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    isStaff: roles.length > 0,
    signOut: () => supabase.auth.signOut(),
  };
}
