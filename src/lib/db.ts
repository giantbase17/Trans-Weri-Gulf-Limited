import { supabase } from "@/integrations/supabase/client";

export type Equipment = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  specifications: Record<string, string> | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  daily_rate_usd: number | null;
  weekly_rate_usd: number | null;
  monthly_rate_usd: number | null;
  currency: string;
  quote_only: boolean;
  status: string;
  location: string;
  total_units: number;
  available_units: number;
  rented_units: number;
  maintenance_units: number;
  low_stock_threshold: number;
  primary_image_url: string | null;
  featured: boolean;
  published: boolean;
  for_rent: boolean;
  for_sale: boolean;
  sale_price: number | null;
  sale_price_usd: number | null;
  sale_currency: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentImage = {
  id: string;
  equipment_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type Enquiry = {
  id: string;
  reference: string;
  equipment_id: string | null;
  equipment_name: string | null;
  full_name: string;
  email: string | null;
  phone: string;
  company: string | null;
  project_location: string | null;
  rental_period: string | null;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  status: string;
  outcome: string | null;
  assigned_to: string | null;
  next_action_date: string | null;
  customer_id: string | null;
  internal_notes: string | null;
  quantity: number;
  transaction_type: string;
  unit_price: number | null;
  total_value: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  full_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type SiteSettings = {
  id: boolean;
  company_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  updated_at: string;
};

export type SitePost = {
  id: string;
  kind: "news" | "blog" | "incoming";
  title: string;
  slug: string;
  excerpt: string;
  body: string | null;
  image_url: string | null;
  publish_date: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

interface QueryResult {
  data: unknown;
  error: unknown;
}
// Supabase's query builder is itself thenable (awaiting it without calling
// .single()/.maybeSingle() resolves to a QueryResult), so SupabaseTable
// extends Promise<QueryResult> rather than only exposing chain methods.
interface SupabaseTable extends Promise<QueryResult> {
  select: (...args: unknown[]) => SupabaseTable;
  order: (...args: unknown[]) => SupabaseTable;
  eq: (...args: unknown[]) => SupabaseTable;
  maybeSingle: () => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
  insert: (...args: unknown[]) => SupabaseTable;
  update: (...args: unknown[]) => SupabaseTable;
  upsert: (...args: unknown[]) => SupabaseTable;
  delete: (...args: unknown[]) => SupabaseTable;
}

const sb = supabase as unknown as {
  from: (table: string) => SupabaseTable;
  storage: typeof supabase.storage;
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown }>;
};

export async function fetchEquipmentList(): Promise<Equipment[]> {
  const { data, error } = await sb
    .from("equipment")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Equipment[];
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await sb
    .from("site_settings")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as SiteSettings | null;
}

export async function saveSiteSettings(payload: Partial<SiteSettings>) {
  const { data, error } = await sb
    .from("site_settings")
    .upsert({ id: true, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function fetchSitePosts(
  includeUnpublished = false,
): Promise<SitePost[]> {
  let query = sb
    .from("site_posts")
    .select("*")
    .order("publish_date", { ascending: false });
  if (!includeUnpublished) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SitePost[];
}

export async function saveSitePost(payload: Partial<SitePost>) {
  const { data, error } = await sb
    .from("site_posts")
    .upsert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as SitePost;
}

export async function deleteSitePost(id: string) {
  const { error } = await sb.from("site_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadSiteAsset(file: File, prefix: string) {
  const path = `${prefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await sb.storage
    .from("site-assets")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await sb.storage
    .from("site-assets")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr) throw signErr;
  return data.signedUrl as string;
}

export async function fetchAllEquipmentAdmin(): Promise<Equipment[]> {
  const { data, error } = await sb
    .from("equipment")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Equipment[];
}

export async function fetchEquipmentBySlug(slug: string) {
  const { data, error } = await sb
    .from("equipment")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Equipment | null;
}

export async function fetchEquipmentImages(
  equipmentId: string,
): Promise<EquipmentImage[]> {
  const { data, error } = await sb
    .from("equipment_images")
    .select("*")
    .eq("equipment_id", equipmentId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EquipmentImage[];
}

export async function createEnquiry(payload: Partial<Enquiry>) {
  const { error } = await sb.from("enquiries").insert({
    ...payload,
    outcome: 'pending', // Default outcome for new enquiries
  });
  if (error) throw error;
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await sb
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Enquiry[];
}

export async function updateEnquiry(id: string, patch: Partial<Enquiry>) {
  const { error } = await sb.from("enquiries").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteEnquiry(id: string) {
  const { error } = await sb.from("enquiries").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await sb
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function upsertCustomer(payload: Partial<Customer>) {
  const { error } = await sb.from("customers").upsert(payload);
  if (error) throw error;
}

export async function deleteCustomer(id: string) {
  const { error } = await sb.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function saveEquipment(payload: Partial<Equipment>) {
  const { data, error } = await sb
    .from("equipment")
    .upsert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Equipment;
}

/**
 * Updates specific columns on an existing equipment row. Prefer this over
 * saveEquipment's upsert for partial edits (e.g. setting primary_image_url
 * after a photo upload) — upsert is for insert-or-replace by full record,
 * and a partial payload through it is the wrong tool for "patch this one
 * field on a row I know exists".
 */
export async function updateEquipment(id: string, patch: Partial<Equipment>) {
  const { error } = await sb.from("equipment").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteEquipment(id: string) {
  const { error } = await sb.from("equipment").delete().eq("id", id);
  if (error) throw error;
}

export async function addEquipmentImage(
  equipmentId: string,
  url: string,
  sortOrder: number,
) {
  const { error } = await sb
    .from("equipment_images")
    .insert({ equipment_id: equipmentId, url, sort_order: sortOrder });
  if (error) throw error;
}

export async function removeEquipmentImage(id: string) {
  const { error } = await sb.from("equipment_images").delete().eq("id", id);
  if (error) throw error;
}

/** Uploads a photo to the private bucket and returns a long-lived signed URL. */
export async function uploadEquipmentPhoto(file: File, slug: string) {
  const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await sb.storage
    .from("equipment-photos")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  const { data, error: signErr } = await sb.storage
    .from("equipment-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr) throw signErr;
  return data.signedUrl as string;
}

export async function fetchMyRoles(userId: string): Promise<string[]> {
  const { data, error } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw error;
  return ((data ?? []) as { role: string }[]).map((r) => r.role);
}

export async function bootstrapAdmin(userId: string): Promise<boolean> {
  const { data, error } = await sb.rpc("bootstrap_first_admin", {
    requested_user_id: userId,
  });
  if (error) throw error;
  return data === true;
}

export type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: string[];
};

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const { data: profiles, error: profilesError } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (profilesError) throw profilesError;
  
  const profilesList = (profiles ?? []) as any[];
  
  // Fetch roles for each user
  const usersWithRoles = await Promise.all(
    profilesList.map(async (profile) => {
      const roles = await fetchMyRoles(profile.id);
      return {
        ...profile,
        roles,
      };
    })
  );
  
  return usersWithRoles as UserProfile[];
}

export async function assignRole(userId: string, role: string) {
  const { error } = await sb.rpc("admin_assign_role", {
    target_user_id: userId,
    new_role: role,
  });
  if (error) throw error;
}

export async function removeRole(userId: string, role: string) {
  const { error } = await sb.rpc("admin_remove_role", {
    target_user_id: userId,
    role_to_remove: role,
  });
  if (error) throw error;
}

export async function deleteUser(userId: string) {
  // Try RPC function first, fall back to direct deletion if function doesn't exist
  try {
    const { error } = await sb.rpc("admin_delete_user", {
      target_user_id: userId,
    });
    if (error) throw error;
  } catch (error) {
    console.log("RPC function not available, using direct deletion");
    // Fallback: Direct deletion
    const { error: roleError } = await sb
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (roleError) console.error("Failed to delete roles:", roleError);
    
    const { error: profileError } = await sb
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) throw profileError;
  }
}

/**
 * Invite-only user creation: the admin never sets or sees a password. This
 * calls a server-side function that creates the auth user, assigns their
 * role, and emails them a one-time link to set their own password.
 */
export async function inviteUser(params: {
  email: string;
  fullName?: string;
  role: string;
}) {
  const { error } = await supabase.functions.invoke("invite-user", {
    body: {
      email: params.email,
      fullName: params.fullName,
      role: params.role,
      siteUrl: typeof window === "undefined" ? "" : window.location.origin,
    },
  });
  if (error) throw error;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { error } = await sb
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}
