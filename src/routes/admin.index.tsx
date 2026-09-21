import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Handshake,
  ImagePlus,
  LayoutDashboard,
  Leaf,
  Lock,
  LogOut,
  Mail,
  Newspaper,
  Package,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import {
  addEquipmentCategory,
  deleteEquipmentCategory,
  renameEquipmentCategory,
  addEquipmentImage,
  assignRole,
  createEnquiry,
  deleteCustomer as deleteCustomerRecord,
  deleteEnquiry as deleteEnquiryRecord,
  deleteEquipment,
  deleteSitePost,
  deleteUser,
  fetchAllEquipmentAdmin,
  fetchAllUsers,
  fetchEquipmentCategories,
  fetchEquipmentImages,
  fetchEquipmentList,
  fetchCustomers,
  fetchEnquiries,
  fetchSitePosts,
  fetchSiteSettings,
  createUserAccount,
  removeEquipmentImage,
  removeRole,
  resetUserPassword,
  saveEquipment,
  saveSitePost,
  saveSiteSettings,
  upsertCustomer,
  updateEnquiry,
  updateEquipment,
  uploadEquipmentPhoto,
  uploadSiteAsset,
  type Customer,
  type Equipment,
  type EquipmentCategory,
  type EquipmentImage,
  type Enquiry,
  type SitePost,
  type SiteSettings,
  type UserProfile,
} from "@/lib/db";
import {
  ALL_PERMISSIONS,
  ALL_ROLES,
  ALL_SERVICE_TYPES,
  CATEGORIES,
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_TRANSITIONS,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
  STATUSES,
  categoryLabel,
  equipmentImageUrl,
  formatDualCurrency,
  hasPermission,
  roleLabel,
  serviceTypeLabel,
  site,
} from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import heroBackground from "@/assests/background.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/site/AuthShell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentPanel } from "@/components/site/ContentPanel";
import { cn, getErrorMessage, getSiteUrl } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: `Admin | ${site.name}` }] }),
  component: AdminPage,
});

type Tab = "overview" | "equipment" | "enquiries" | "customers" | "analytics" | "users" | "content";

const IDLE_LOGOUT_MS = 30 * 60 * 1000;

const emptyEquipment: Partial<Equipment> = {
  name: "",
  slug: "",
  category: "excavators",
  brand: "",
  model: "",
  description: "",
  location: site.addressShort,
  status: "available",
  total_units: 1,
  available_units: 1,
  rented_units: 0,
  maintenance_units: 0,
  daily_rate: null,
  weekly_rate: null,
  monthly_rate: null,
  daily_rate_usd: null,
  weekly_rate_usd: null,
  monthly_rate_usd: null,
  quote_only: false,
  featured: false,
  published: true,
  for_rent: true,
  for_sale: false,
  sale_price: null,
  sale_price_usd: null,
  sale_currency: "NGN",
};

const previewEquipment: Equipment[] = [
  {
    id: "preview-excavator",
    name: "Caterpillar 336D2 Excavator",
    slug: "preview-excavator",
    category: "excavators",
    brand: "Caterpillar",
    model: "336D2",
    description: "Heavy-duty excavator for bulk earthworks and civil works.",
    specifications: { "Operating Weight": "36,000 kg" },
    daily_rate: 450000,
    weekly_rate: 2700000,
    monthly_rate: 9500000,
    daily_rate_usd: null,
    weekly_rate_usd: null,
    monthly_rate_usd: null,
    currency: "NGN",
    quote_only: false,
    status: "available",
    location: "Yenagoa, Bayelsa State",
    total_units: 3,
    available_units: 2,
    rented_units: 1,
    maintenance_units: 0,
    low_stock_threshold: 1,
    primary_image_url: null,
    featured: true,
    published: true,
    for_rent: true,
    for_sale: false,
    sale_price: null,
    sale_price_usd: null,
    sale_currency: "NGN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-crane",
    name: "XCMG QY50K-II Truck Crane",
    slug: "preview-crane",
    category: "cranes",
    brand: "XCMG",
    model: "QY50K-II",
    description: "50-tonne hydraulic truck crane for structural lifts.",
    specifications: { "Max Lifting Capacity": "50 tonnes" },
    daily_rate: null,
    weekly_rate: null,
    monthly_rate: null,
    daily_rate_usd: null,
    weekly_rate_usd: null,
    monthly_rate_usd: null,
    currency: "NGN",
    quote_only: true,
    status: "available",
    location: "Yenagoa, Bayelsa State",
    total_units: 2,
    available_units: 1,
    rented_units: 1,
    maintenance_units: 0,
    low_stock_threshold: 1,
    primary_image_url: null,
    featured: true,
    published: true,
    for_rent: true,
    for_sale: false,
    sale_price: null,
    sale_price_usd: null,
    sale_currency: "NGN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const previewEnquiries: Enquiry[] = [
  {
    id: "preview-enquiry",
    reference: "TWG-PREVIEW",
    equipment_id: previewEquipment[0]?.id ?? null,
    equipment_name: previewEquipment[0]?.name ?? null,
    full_name: "Amina Okafor",
    email: "projects@example.com",
    phone: "0801 234 5678",
    company: "Delta Works Ltd",
    project_location: "Yenagoa",
    rental_period: "Monthly",
    start_date: null,
    end_date: null,
    message: "Excavator required for a road formation package.",
    status: "new",
    outcome: "pending",
    assigned_to: null,
    next_action_date: null,
    customer_id: null,
    internal_notes: null,
    quantity: 1,
    transaction_type: "rental",
    service_type: "equipment_rental",
    unit_price: null,
    total_value: null,
    currency: "NGN",
    preferred_contact: "whatsapp",
    duration_days: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const previewCustomers: Customer[] = [
  {
    id: "preview-customer",
    full_name: "Amina Okafor",
    company: "Delta Works Ltd",
    email: "projects@example.com",
    phone: "0801 234 5678",
    address: "Yenagoa, Bayelsa State",
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const previewPosts: SitePost[] = [
  {
    id: "preview-news",
    kind: "news",
    title: "A stronger equipment partner for Niger Delta projects",
    slug: "niger-delta-equipment-partner",
    excerpt:
      "We are expanding our mobilisation support for contractors working across Bayelsa, riverine communities and the wider Niger Delta.",
    body: null,
    image_url: null,
    link_url: null,
    publish_date: "2026-09-03",
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-blog",
    kind: "blog",
    title: "Choosing the right machine for difficult terrain",
    slug: "choosing-machines-for-difficult-terrain",
    excerpt:
      "A practical guide to matching excavators, dozers and support equipment to access, ground conditions and programme demands.",
    body: null,
    image_url: null,
    link_url: null,
    publish_date: "2026-08-28",
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-incoming",
    kind: "incoming",
    title: "New lifting and dredging capacity on the horizon",
    slug: "new-lifting-and-dredging-capacity",
    excerpt:
      "Ask our team about upcoming crane and dredging equipment availability so we can reserve capacity for your next project.",
    body: null,
    image_url: null,
    link_url: null,
    publish_date: new Date().toISOString().slice(0, 10),
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function AdminPage() {
  const auth = useAuth();
  const preview =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  if (auth.loading) return <LoadingScreen />;
  if (preview) return <Dashboard auth={auth} preview />;
  if (!auth.user) return <LoginScreen />;
  if (!auth.isStaff) return <AccessDenied onSignOut={auth.signOut} />;
  return <Dashboard auth={auth} />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-deep text-primary-foreground">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.span
          className="h-10 w-10 rounded-full border-2 border-primary-foreground/25 border-t-enterprise-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm font-semibold text-primary-foreground/70">
          Loading workspace...
        </p>
      </motion.div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      const isUnconfirmed = error.message.toLowerCase().includes("confirm");
      setCanResendConfirmation(isUnconfirmed);
      toast.error(
        isUnconfirmed
          ? "Confirm your email address before signing in — check your inbox for the link, or resend it below."
          : error.message,
      );
    } else {
      setCanResendConfirmation(false);
    }
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation email resent — check your inbox.");
  }

  async function forgotPassword() {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }
    setResetting(true);
    const siteUrl = getSiteUrl();
    const redirectTo = siteUrl ? `${siteUrl}/auth` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      redirectTo ? { redirectTo } : {},
    );
    setResetting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset email sent.");
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" as const }}
        className="w-full max-w-md"
      >
      <Card className="border-none bg-background text-foreground shadow-2xl">
        <CardContent className="p-8">
          <span className="block h-1 w-10 rounded-full bg-enterprise-gold" />
          <h2 className="mt-4 text-3xl font-extrabold">Welcome back</h2>
          <p className="mt-1 text-muted-foreground">
            Sign in to manage your fleet operations
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="font-semibold">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2",
                      remember
                        ? "border-brand-deep bg-brand-deep"
                        : "border-input bg-background",
                    )}
                  >
                    {remember && (
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    )}
                  </span>
                  Remember me
                </button>
                <button
                  type="button"
                  onClick={() => void forgotPassword()}
                  disabled={resetting}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={busy}
              >
                {busy ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {canResendConfirmation && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={busy}
                  onClick={() => void resendConfirmation()}
                >
                  Resend confirmation email
                </Button>
              )}
            </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              to="/auth"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Need to set up your administrator account?
            </Link>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </AuthShell>
  );
}

function AccessDenied({ onSignOut }: { onSignOut: () => Promise<unknown> }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-enterprise-gold" />
        <h1 className="mt-5 text-3xl">Staff access required</h1>
        <p className="mt-3 text-muted-foreground">
          Your account is authenticated, but it has no Trans Weri Gulf staff
          role.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => void onSignOut()}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </main>
  );
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  super_admin: "bg-enterprise-gold/15 text-enterprise-gold",
  admin: "bg-enterprise-royal/15 text-enterprise-royal",
  manager: "bg-field/15 text-field",
  sales_manager: "bg-violet-500/15 text-violet-600",
  equipment_manager: "bg-teal-500/15 text-teal-600",
  staff: "bg-sky-500/15 text-sky-600",
};

function RoleBadges({ roles }: { roles: string[] }) {
  if (roles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <span
          key={role}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${ROLE_BADGE_STYLES[role] ?? "bg-secondary text-secondary-foreground"}`}
        >
          {roleLabel(role)}
        </span>
      ))}
    </div>
  );
}

/** Ticks every 30s so a greeting reflects the actual current time of day
 * without needing a page refresh. */
function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard({
  auth,
  preview = false,
}: {
  auth: ReturnType<typeof useAuth>;
  preview?: boolean;
}) {
  const now = useLiveClock();
  const [tab, setTab] = useState<Tab>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Equipment> | null>(null);
  const [enquiryQuickFilter, setEnquiryQuickFilter] =
    useState<EnquiryQuickFilter>("all");
  const queryClient = useQueryClient();

  useIdleLogout(
    () => {
      toast.info("Signed out after 30 minutes of inactivity.");
      void auth.signOut();
    },
    IDLE_LOGOUT_MS,
    { enabled: !preview },
  );

  function goToEnquiries(filter: EnquiryQuickFilter = "all") {
    setEnquiryQuickFilter(filter);
    setTab("enquiries");
  }
  
  // Calculate user permissions
  const permissions = useMemo(() => {
    const userRoles = auth.roles;
    return {
      canManageUsers: hasPermission(userRoles, "canManageUsers"),
      canManageEquipment: hasPermission(userRoles, "canManageEquipment"),
      canManageEnquiries: hasPermission(userRoles, "canManageEnquiries"),
      canManageCustomers: hasPermission(userRoles, "canManageCustomers"),
      canManageContent: hasPermission(userRoles, "canManageContent"),
      canViewAll: hasPermission(userRoles, "canViewAll"),
    };
  }, [auth.roles]);
  useEffect(() => {
    if (preview) return;
    const channel = supabase
      .channel("admin-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["enquiries", "admin"],
          });
          void queryClient.invalidateQueries({
            queryKey: ["customers", "admin"],
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["customers", "admin"],
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [preview, queryClient]);
  const equipment = useQuery({
    queryKey: ["equipment", "admin"],
    queryFn: preview
      ? async () => {
          try {
            return await fetchEquipmentList();
          } catch {
            return previewEquipment;
          }
        }
      : fetchAllEquipmentAdmin,
  });
  const enquiries = useQuery({
    queryKey: ["enquiries", "admin"],
    queryFn: preview ? () => Promise.resolve(previewEnquiries) : fetchEnquiries,
  });
  const customers = useQuery({
    queryKey: ["customers", "admin"],
    queryFn: preview ? () => Promise.resolve(previewCustomers) : fetchCustomers,
  });
  const users = useQuery({
    queryKey: ["users", "admin"],
    queryFn: preview ? () => Promise.resolve([]) : fetchAllUsers,
  });
  // profiles.full_name (set on account creation) is the real display name —
  // auth.user_metadata.full_name is often blank, which used to leave the
  // greeting falling back to the email's local part (e.g. "emekaonu7").
  const displayName =
    users.data?.find((u) => u.id === auth.user?.id)?.full_name?.trim() ||
    (auth.user?.user_metadata as { full_name?: string } | undefined)?.full_name?.trim() ||
    auth.user?.email?.split("@")[0] ||
    "there";
  const settings = useQuery({
    queryKey: ["site-settings", "admin"],
    queryFn: preview ? () => Promise.resolve(null) : fetchSiteSettings,
  });
  const posts = useQuery({
    queryKey: ["site-posts", "admin"],
    queryFn: preview
      ? () => Promise.resolve(previewPosts)
      : () => fetchSitePosts(true),
  });
  const items = useMemo(() => equipment.data ?? [], [equipment.data]);
  const requests = useMemo(() => enquiries.data ?? [], [enquiries.data]);
  const stats = useMemo(
    () => ({
      units: items.reduce((n, e) => n + e.total_units, 0),
      available: items.reduce((n, e) => n + e.available_units, 0),
      rented: items.reduce((n, e) => n + e.rented_units, 0),
      maintenance: items.reduce((n, e) => n + e.maintenance_units, 0),
      low: items.filter((e) => e.available_units <= e.low_stock_threshold)
        .length,
    }),
    [items],
  );

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["equipment", "admin"] });
    void queryClient.invalidateQueries({ queryKey: ["equipment", "public"] });
    void queryClient.invalidateQueries({ queryKey: ["enquiries", "admin"] });
    void queryClient.invalidateQueries({ queryKey: ["customers", "admin"] });
    void queryClient.invalidateQueries({
      queryKey: ["site-settings", "admin"],
    });
    void queryClient.invalidateQueries({ queryKey: ["site-posts", "admin"] });
  }
  function openNew() {
    setEditing({ ...emptyEquipment });
    setShowForm(true);
  }
  function openEdit(item: Equipment) {
    setEditing({ ...item });
    setShowForm(true);
  }

  return (
    <div className="relative min-h-screen bg-secondary/40 lg:flex">
      {/* Same faint brand watermark as the public site (see SiteLayout) —
       * the admin shell has its own layout instead of SiteLayout, so it
       * needs its own copy to show the logo through its light backgrounds. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <img
          src={site.watermark}
          alt=""
          className="w-[90vw] max-w-3xl opacity-[0.035] sm:w-[55vw]"
        />
      </div>
      <aside className="relative z-10 w-full border-b border-border bg-brand-deep text-primary-foreground lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <img
            src={settings.data?.logo_url ?? site.logo}
            alt={settings.data?.company_name ?? site.name}
            className="h-16 w-fit max-w-[220px] rounded bg-background p-1.5 object-contain"
          />
          <div className="hidden lg:block">
            <p className="mt-5 text-lg font-bold">Business control</p>
            <p className="mt-1 text-xs text-primary-foreground/60">
              {preview ? "Preview mode · sample data" : auth.user?.email}
            </p>
            {!preview && (
              <div className="mt-2">
                <RoleBadges roles={auth.roles} />
              </div>
            )}
          </div>
          <button
            className="lg:hidden"
            onClick={() => void auth.signOut()}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <p className="hidden px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/40 lg:block">
          People <span className="mx-1.5">·</span> Services{" "}
          <span className="mx-1.5">·</span> Progress
        </p>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-6 lg:block lg:flex-1 lg:overflow-y-auto lg:px-3">
          {(
            [
              ["overview", "Overview", LayoutDashboard, true],
              ["equipment", "Equipment", Package, permissions.canManageEquipment || permissions.canViewAll],
              ["enquiries", "Enquiries", Send, permissions.canManageEnquiries || permissions.canViewAll],
              ["customers", "Customers", Users, permissions.canManageCustomers || permissions.canViewAll],
              ["analytics", "Analytics", BarChart3, permissions.canViewAll],
              ["users", "Users & Roles", ShieldAlert, permissions.canManageUsers],
              ["content", "Site content", Newspaper, permissions.canManageContent],
            ] as const
          ).filter(([_, __, ___, visible]) => visible).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`relative flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors lg:mb-1 lg:w-full ${tab === value ? "text-enterprise-gold-foreground" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}
            >
              {tab === value && (
                <motion.span
                  layoutId="admin-nav-active"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-md bg-enterprise-gold"
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
              {value === "enquiries" &&
                requests.filter((e) => e.status === "new").length > 0 && (
                  <span className="relative ml-auto rounded-full bg-field px-2 py-0.5 text-xs text-field-foreground">
                    {requests.filter((e) => e.status === "new").length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block">
          <div className="mx-4 border-t border-primary-foreground/10 pt-3">
            <button
              onClick={() => void auth.signOut()}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
          <div className="relative mt-3 h-32 shrink-0 overflow-hidden">
            <img
              src={heroBackground}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-brand-deep/20" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
              <span className="mb-2 block h-0.5 w-8 bg-enterprise-gold" />
              <p className="text-xs font-semibold leading-snug text-primary-foreground/85">
                Built for a stronger Nigeria&apos;s infrastructure
              </p>
            </div>
          </div>
        </div>
      </aside>
      <main className="relative z-10 w-full px-4 py-8 sm:px-6 lg:ml-64 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {tab === "overview" && (
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-sky-600">
                  {greetingForHour(now.getHours())}, {displayName}
                  <span className="text-xs font-normal text-muted-foreground">
                    ·{" "}
                    {now.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              )}
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-enterprise-gold">
                {site.addressShort}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl">
                {tab === "overview"
                  ? "Business performance, at a glance."
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </h1>
              {tab === "overview" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Track demand across every service line, monitor your
                  equipment fleet and keep operations moving.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {preview && <Badge variant="secondary">LOCAL PREVIEW</Badge>}
              {tab === "overview" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-field/10 px-3 py-1.5 text-xs font-semibold text-field">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-field" />
                  Live data
                </span>
              )}
              <Button onClick={refresh}>
                <RefreshCw className="h-4 w-4" /> Refresh data
              </Button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" as const }}
            >
              {tab === "overview" && (
                <Overview
                  stats={stats}
                  enquiries={requests}
                  equipment={items}
                  onEnquiries={goToEnquiries}
                  onEquipment={() => setTab("equipment")}
                />
              )}
              {tab === "equipment" && (
                <EquipmentPanel
                  items={items}
                  onNew={permissions.canManageEquipment ? openNew : undefined}
                  onEdit={permissions.canManageEquipment ? openEdit : undefined}
                  onDelete={permissions.canManageEquipment ? async (id) => {
                    await deleteEquipment(id);
                    refresh();
                    toast.success("Equipment deleted");
                  } : undefined}
                  readOnly={!permissions.canManageEquipment}
                />
              )}
              {tab === "enquiries" && (
                <EnquiriesPanel
                  enquiries={requests}
                  users={users.data ?? []}
                  preview={preview}
                  onSaved={refresh}
                  canManage={permissions.canManageEnquiries}
                  initialQuickFilter={enquiryQuickFilter}
                />
              )}
              {tab === "customers" && (
                <CustomersPanel
                  customers={customers.data ?? []}
                  enquiries={enquiries.data ?? []}
                  onSaved={() => {
                    void queryClient.invalidateQueries({
                      queryKey: ["customers", "admin"],
                    });
                  }}
                  canManage={permissions.canManageCustomers}
                />
              )}
              {tab === "analytics" && (
                <AnalyticsPanel
                  equipment={items}
                  enquiries={requests}
                  customers={customers.data ?? []}
                />
              )}
              {tab === "users" && (
                <UsersPanel
                  users={users.data ?? []}
                  currentUser={auth.user?.id}
                  viewerIsSuperAdmin={auth.roles.includes("super_admin")}
                  onSaved={() => {
                    void queryClient.invalidateQueries({
                      queryKey: ["users", "admin"],
                    });
                  }}
                />
              )}
              {tab === "content" && permissions.canManageContent && (
                <ContentPanel
                  settings={settings.data}
                  posts={posts.data ?? []}
                  onSaved={refresh}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {showForm && (
        <EquipmentForm
          initial={editing ?? emptyEquipment}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

const enquiryStatusStyles: Record<string, string> = {
  new: "bg-brand/10 text-brand",
  contacted: "bg-enterprise-gold/10 text-enterprise-gold",
  quoted: "bg-enterprise-gold/10 text-enterprise-gold",
  won: "bg-field/10 text-field",
  lost: "bg-secondary text-muted-foreground",
};

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Counts up to `value` on mount/change instead of popping in — used for
 * every KPI figure across the dashboard so the numbers feel alive rather
 * than static text. */
function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return <motion.span>{display}</motion.span>;
}

const fadeUpContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

function Overview({
  stats,
  enquiries,
  equipment,
  onEnquiries,
  onEquipment,
}: {
  stats: {
    units: number;
    available: number;
    rented: number;
    maintenance: number;
    low: number;
  };
  enquiries: Enquiry[];
  equipment: Equipment[];
  onEnquiries: (filter?: EnquiryQuickFilter) => void;
  onEquipment: () => void;
}) {
  const cards = [
    ["Total units", stats.units, Package, "text-brand", "bg-brand/10"],
    ["Available", stats.available, CheckCircle2, "text-field", "bg-field/10"],
    ["Rented out", stats.rented, BarChart3, "text-enterprise-royal", "bg-enterprise-royal/10"],
    ["Maintenance", stats.maintenance, Wrench, "text-steel", "bg-steel/10"],
  ] as const;
  const lowStock = equipment
    .filter((e) => e.available_units <= e.low_stock_threshold)
    .slice(0, 5);

  const newToday = enquiries.filter(
    (e) => e.status === "new" && isToday(e.created_at),
  ).length;
  const awaiting = enquiries.filter(
    (e) => e.status === "new" && !isToday(e.created_at),
  ).length;
  const followUpDue = enquiries.filter(
    (e) =>
      !!e.next_action_date &&
      (isToday(e.next_action_date) || isOverdueFollowUp(e.next_action_date)),
  ).length;
  const closing = enquiries.filter((e) =>
    ["quoted", "won", "lost"].includes(e.status),
  ).length;

  const serviceLineCounts = useMemo(() => {
    const counts = new Map<string, number>(
      ALL_SERVICE_TYPES.map((type) => [type, 0]),
    );
    for (const e of enquiries) {
      const type = e.service_type ?? "equipment_rental";
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return ALL_SERVICE_TYPES.map((type) => ({
      type,
      label: serviceTypeLabel(type),
      count: counts.get(type) ?? 0,
    })).sort((a, b) => b.count - a.count);
  }, [enquiries]);
  const maxServiceCount = Math.max(1, ...serviceLineCounts.map((s) => s.count));

  const leadCards = [
    [
      "New today",
      newToday,
      Send,
      "text-brand",
      "bg-brand/10",
      "new_today",
    ],
    [
      "Awaiting response",
      awaiting,
      AlertTriangle,
      "text-enterprise-gold",
      "bg-enterprise-gold/10",
      "awaiting",
    ],
    [
      "Follow up due",
      followUpDue,
      CalendarClock,
      "text-steel",
      "bg-steel/10",
      "follow_up",
    ],
    [
      "Quoted / Won / Lost",
      closing,
      Handshake,
      "text-field",
      "bg-field/10",
      "closing",
    ],
  ] as const;

  return (
    <>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Leads across every service line
      </p>
      <motion.div
        variants={fadeUpContainer}
        initial="hidden"
        animate="show"
        className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {leadCards.map(([label, value, Icon, color, bg, filter]) => (
          <motion.button
            key={label}
            variants={fadeUpItem}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEnquiries(filter)}
            className="text-left"
          >
            <Card className="transition-shadow hover:shadow-lift">
              <CardContent className="flex items-center gap-4 p-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    <AnimatedNumber value={value} />
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </motion.div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Equipment fleet
      </p>
      <motion.div
        variants={fadeUpContainer}
        initial="hidden"
        animate="show"
        className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map(([label, value, Icon, color, bg]) => (
          <motion.div key={label} variants={fadeUpItem} whileHover={{ y: -3 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    <AnimatedNumber value={value} />
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Latest enquiries</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent customer enquiries and requests
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEnquiries()}>
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {enquiries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <FileText className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold">No enquiries yet.</p>
                  <p className="text-sm text-muted-foreground">
                    When customers make enquiries, they will appear here.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onEnquiries()}>
                  <Plus className="h-4 w-4" /> New enquiry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Customer</th>
                      <th className="py-2 pr-3 font-semibold">Equipment</th>
                      <th className="py-2 pr-3 font-semibold">
                        Project location
                      </th>
                      <th className="py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.slice(0, 5).map((e) => (
                      <tr key={e.id} className="border-t border-border">
                        <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                          {formatShortDate(e.created_at)}
                        </td>
                        <td className="py-3 pr-3 font-semibold">
                          {e.full_name}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">
                          {e.equipment_name ?? "General enquiry"}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">
                          {e.project_location ?? "—"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enquiryStatusStyles[e.status] ?? "bg-secondary text-muted-foreground"}`}
                          >
                            {ENQUIRY_STATUSES.find((s) => s.value === e.status)
                              ?.label ?? e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory watch</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stats.low
                    ? `${stats.low} item(s) at or below low stock threshold.`
                    : "Inventory levels are healthy."}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onEquipment}>
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-field">
                  <Check className="h-4 w-4" /> Inventory levels are healthy.
                </p>
              ) : (
                lowStock.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{e.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-semibold">
                        {e.available_units}/{e.total_units}
                      </span>
                      <span
                        className={
                          e.available_units === 0
                            ? "font-semibold text-amber-800"
                            : "font-semibold text-amber-600"
                        }
                      >
                        {e.available_units === 0 ? "Critical" : "Low"}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="border-none bg-field/10">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-field text-field-foreground">
                <Leaf className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">Keep your fleet ready</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor stock levels and maintenance to minimise downtime.
                </p>
                <Button
                  variant="field"
                  size="sm"
                  className="mt-3"
                  onClick={onEquipment}
                >
                  Manage inventory <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Enquiries by service line</CardTitle>
            <p className="text-sm text-muted-foreground">
              Where demand is coming from across all seven service lines —
              not just equipment.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceLineCounts.every((s) => s.count === 0) ? (
              <p className="text-sm text-muted-foreground">
                No enquiries yet across any service line.
              </p>
            ) : (
              serviceLineCounts.map((s) => (
                <div key={s.type} className="flex items-center gap-3 text-sm">
                  <span className="w-44 shrink-0 truncate font-medium">
                    {s.label}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-brand"
                      style={{
                        width: `${(s.count / maxServiceCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-semibold">
                    {s.count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

function EquipmentPanel({
  items,
  onNew,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  items: Equipment[];
  onNew?: (() => void) | undefined;
  onEdit?: ((item: Equipment) => void) | undefined;
  onDelete?: ((id: string) => Promise<void>) | undefined;
  readOnly?: boolean;
}) {
  const [term, setTerm] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Equipment | null>(null);
  const filtered = items.filter((e) =>
    `${e.name} ${e.brand} ${e.model}`
      .toLowerCase()
      .includes(term.toLowerCase()),
  );
  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search equipment..."
            className="pl-9"
          />
        </div>
        {!readOnly && onNew && (
          <Button variant="gold" onClick={onNew}>
            <Plus className="h-4 w-4" /> Add equipment
          </Button>
        )}
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Inventory</th>
                <th className="px-4 py-3">Rates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.brand} {e.model}
                    </p>
                  </td>
                  <td className="px-4 py-4">{categoryLabel(e.category)}</td>
                  <td className="px-4 py-4">
                    {e.available_units} available{" "}
                    <span className="text-muted-foreground">
                      / {e.total_units} total
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {e.quote_only
                      ? "Quote only"
                      : formatDualCurrency(e.daily_rate, e.daily_rate_usd)}
                    <p className="text-xs text-muted-foreground">daily</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={
                          e.status === "available" ? "default" : "secondary"
                        }
                      >
                        {STATUSES.find((s) => s.value === e.status)?.label ??
                          e.status}
                      </Badge>
                      {!e.published && (
                        <Badge variant="secondary" className="text-enterprise-gold">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {!readOnly && (
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(e)}
                            aria-label={`Edit ${e.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setPendingDelete(e)}
                            aria-label={`Delete ${e.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-enterprise-navy" />
                          </Button>
                        )}
                      </div>
                    )}
                    {readOnly && (
                      <span className="text-sm text-muted-foreground">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.name ?? "this equipment"}?`}
        description="This permanently removes the record from your fleet, including its rates, specifications and photos. This cannot be undone."
        confirmLabel="Delete equipment"
        onConfirm={async () => {
          if (pendingDelete && onDelete) await onDelete(pendingDelete.id);
        }}
      />
    </section>
  );
}

function EquipmentForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<Equipment>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Equipment>>(initial);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [managingCategories, setManagingCategories] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryLabel, setEditingCategoryLabel] = useState("");
  const queryClient = useQueryClient();
  const equipmentId = form.id;
  const MAX_PHOTOS = 4;
  const { data: categories } = useQuery({
    queryKey: ["equipment-categories"],
    queryFn: fetchEquipmentCategories,
  });
  const { data: images = [] } = useQuery({
    queryKey: ["equipment-images", equipmentId],
    queryFn: () => fetchEquipmentImages(equipmentId!),
    enabled: !!equipmentId,
  });

  function refetchImages() {
    return queryClient.invalidateQueries({
      queryKey: ["equipment-images", equipmentId],
    });
  }

  async function handleSelectPhotos(selected: File[]) {
    if (selected.length === 0) return;
    if (!equipmentId) {
      // Brand-new equipment has no id yet — queue photos, uploaded once
      // the record is created on submit.
      const room = MAX_PHOTOS - files.length;
      if (room <= 0) {
        toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
        return;
      }
      if (selected.length > room) {
        toast.error(`Only ${room} more photo(s) allowed (max ${MAX_PHOTOS}).`);
      }
      setFiles((prev) => [...prev, ...selected.slice(0, room)]);
      return;
    }

    const room = MAX_PHOTOS - images.length;
    if (room <= 0) {
      toast.error(`This equipment already has the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    if (selected.length > room) {
      toast.error(`Only ${room} more photo(s) allowed (max ${MAX_PHOTOS}).`);
    }
    setUploadingPhoto(true);
    try {
      let nextSortOrder = images.length;
      for (const file of selected.slice(0, room)) {
        const url = await uploadEquipmentPhoto(file, form.slug || equipmentId);
        await addEquipmentImage(equipmentId, url, nextSortOrder++);
        if (!form.primary_image_url) {
          await updateEquipment(equipmentId, { primary_image_url: url });
          set("primary_image_url", url);
        }
      }
      await refetchImages();
      toast.success("Photo added");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload photo"));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(image: EquipmentImage) {
    try {
      await removeEquipmentImage(image.id);
      if (form.primary_image_url === image.url) {
        const nextPrimary =
          images.find((i) => i.id !== image.id)?.url ?? null;
        await updateEquipment(equipmentId!, { primary_image_url: nextPrimary });
        set("primary_image_url", nextPrimary);
      }
      await refetchImages();
      toast.success("Photo removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove photo"));
    }
  }

  async function handleSetPrimaryPhoto(image: EquipmentImage) {
    try {
      await updateEquipment(equipmentId!, { primary_image_url: image.url });
      set("primary_image_url", image.url);
      toast.success("Cover photo updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not set cover photo"));
    }
  }

  async function handleAddCategory() {
    if (!newCategoryLabel.trim()) {
      toast.error("Enter a category name");
      return;
    }
    try {
      const created = await addEquipmentCategory(newCategoryLabel);
      await queryClient.invalidateQueries({ queryKey: ["equipment-categories"] });
      set("category", created.value);
      setNewCategoryLabel("");
      setAddingCategory(false);
      toast.success(`Added "${created.label}" category`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add category",
      );
    }
  }

  async function handleRenameCategory(id: string) {
    if (!editingCategoryLabel.trim()) {
      toast.error("Enter a category name");
      return;
    }
    try {
      await renameEquipmentCategory(id, editingCategoryLabel);
      await queryClient.invalidateQueries({
        queryKey: ["equipment-categories"],
      });
      setEditingCategoryId(null);
      toast.success("Category renamed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not rename category",
      );
    }
  }

  async function handleDeleteCategory(id: string, label: string) {
    if (
      !window.confirm(
        `Delete the "${label}" category? This only works if no equipment is currently assigned to it.`,
      )
    ) {
      return;
    }
    try {
      await deleteEquipmentCategory(id);
      await queryClient.invalidateQueries({
        queryKey: ["equipment-categories"],
      });
      toast.success(`Deleted "${label}"`);
    } catch {
      toast.error(
        `"${label}" is still assigned to equipment — move them to another category first.`,
      );
    }
  }
  // Kept as free-typed text, independent of the parsed object below — a
  // textarea whose value is re-derived from a lossy parse of its own
  // onChange output erases whatever you're mid-typing (e.g. a line with no
  // colon yet) on every keystroke.
  const [specsText, setSpecsText] = useState(() =>
    Object.entries(initial.specifications ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
  );
  const set = (key: keyof Equipment, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    setBusy(true);
    try {
      const specifications: Record<string, string> = {};
      for (const line of specsText.split("\n")) {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          specifications[key.trim()] = valueParts.join(":").trim();
        }
      }
      const saved = await saveEquipment({
        ...form,
        specifications,
      });
      for (const [index, file] of files.entries()) {
        const url = await uploadEquipmentPhoto(file, saved.slug);
        await addEquipmentImage(saved.id, url, index);
        // A freshly uploaded photo should become the cover shot — including
        // replacing a stale/legacy image — since there's no separate "set
        // as primary" control elsewhere in this form.
        if (index === 0) {
          await updateEquipment(saved.id, { primary_image_url: url });
        }
      }
      toast.success("Equipment saved");
      onSaved();
    } catch (error) {
      console.error("Equipment save error:", error);
      toast.error(getErrorMessage(error, "Could not save equipment"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-brand-deep/70 p-4 backdrop-blur-sm">
      <Card className="mx-auto my-8 max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-enterprise-gold">
              Fleet record
            </p>
            <CardTitle className="mt-1">
              {form.id ? "Edit equipment" : "Add equipment"}
            </CardTitle>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              {!addingCategory ? (
                <div className="flex gap-2">
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.category ?? "others"}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {(categories ?? CATEGORIES).map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Add new category"
                    onClick={() => setAddingCategory(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Manage categories"
                    onClick={() => setManagingCategories((v) => !v)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    placeholder="e.g. Compactors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleAddCategory();
                      }
                    }}
                  />
                  <Button type="button" onClick={() => void handleAddCategory()}>
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategoryLabel("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {managingCategories && (
                <div className="mt-2 space-y-1.5 rounded-md border p-2">
                  {(categories ?? []).map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      {editingCategoryId === c.id ? (
                        <>
                          <Input
                            autoFocus
                            value={editingCategoryLabel}
                            onChange={(e) =>
                              setEditingCategoryLabel(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleRenameCategory(c.id);
                              }
                            }}
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleRenameCategory(c.id)}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategoryId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{c.label}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            title="Rename"
                            onClick={() => {
                              setEditingCategoryId(c.id);
                              setEditingCategoryLabel(c.label);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() =>
                              void handleDeleteCategory(c.id, c.label)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-enterprise-navy" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input
                value={form.brand ?? ""}
                onChange={(e) => set("brand", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input
                value={form.model ?? ""}
                onChange={(e) => set("model", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Daily rate (NGN)</Label>
              <Input
                type="number"
                value={form.daily_rate ?? ""}
                onChange={(e) =>
                  set(
                    "daily_rate",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Daily rate (USD)</Label>
              <Input
                type="number"
                value={form.daily_rate_usd ?? ""}
                onChange={(e) =>
                  set(
                    "daily_rate_usd",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weekly rate (NGN)</Label>
              <Input
                type="number"
                value={form.weekly_rate ?? ""}
                onChange={(e) =>
                  set(
                    "weekly_rate",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weekly rate (USD)</Label>
              <Input
                type="number"
                value={form.weekly_rate_usd ?? ""}
                onChange={(e) =>
                  set(
                    "weekly_rate_usd",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly rate (NGN)</Label>
              <Input
                type="number"
                value={form.monthly_rate ?? ""}
                onChange={(e) =>
                  set(
                    "monthly_rate",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly rate (USD)</Label>
              <Input
                type="number"
                value={form.monthly_rate_usd ?? ""}
                onChange={(e) =>
                  set(
                    "monthly_rate_usd",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Availability Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.for_rent ?? true}
                    onChange={(e) => set("for_rent", e.target.checked)}
                  />
                  For Rent
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.for_sale ?? false}
                    onChange={(e) => set("for_sale", e.target.checked)}
                  />
                  For Sale
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.published ?? true}
                    onChange={(e) => set("published", e.target.checked)}
                  />
                  Published (visible on site)
                </label>
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.quote_only ?? false}
                  onChange={(e) => set("quote_only", e.target.checked)}
                />
                Quote only — hide the rates below and show "Request quote" on
                the site instead
              </label>
            </div>
            {(form.for_sale || false) && (
              <>
                <div className="space-y-1.5">
                  <Label>Sale Price (NGN)</Label>
                  <Input
                    type="number"
                    value={form.sale_price ?? ""}
                    onChange={(e) =>
                      set(
                        "sale_price",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sale Price (USD)</Label>
                  <Input
                    type="number"
                    value={form.sale_price_usd ?? ""}
                    onChange={(e) =>
                      set(
                        "sale_price_usd",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label>Total units</Label>
              <Input
                type="number"
                min="0"
                value={form.total_units ?? 0}
                onChange={(e) => set("total_units", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Available units</Label>
              <Input
                type="number"
                min="0"
                value={form.available_units ?? 0}
                onChange={(e) => set("available_units", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.status ?? "available"}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Specifications (Key: Value format, one per line)</Label>
              <Textarea
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                placeholder="Max Lifting Capacity: 50 tonnes&#10;Operating Weight: 36,000 kg&#10;Max Reach: 30 meters"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Enter specifications as "Key: Value" pairs, one per line. These will be displayed on the equipment detail page.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" /> Equipment photos (
                {equipmentId ? images.length : files.length}/{MAX_PHOTOS})
              </Label>

              {(images.length > 0 || files.length > 0) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image) => {
                    const isPrimary = form.primary_image_url === image.url;
                    return (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-md border"
                      >
                        <img
                          src={equipmentImageUrl(image.url) ?? undefined}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {isPrimary && (
                          <span className="absolute left-1 top-1 rounded-full bg-enterprise-gold px-2 py-0.5 text-[10px] font-bold uppercase text-enterprise-gold-foreground">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!isPrimary && (
                            <button
                              type="button"
                              title="Set as cover photo"
                              onClick={() => void handleSetPrimaryPhoto(image)}
                              className="rounded p-1 text-white hover:bg-white/20"
                            >
                              <ImagePlus className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete photo"
                            onClick={() => void handleDeletePhoto(image)}
                            className="rounded p-1 text-white hover:bg-white/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!equipmentId &&
                    files.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="group relative aspect-square overflow-hidden rounded-md border"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute left-1 top-1 rounded-full bg-enterprise-gold px-2 py-0.5 text-[10px] font-bold uppercase text-enterprise-gold-foreground">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          title="Remove"
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="absolute inset-x-0 bottom-0 flex justify-center bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                multiple
                disabled={
                  uploadingPhoto ||
                  (equipmentId ? images.length : files.length) >= MAX_PHOTOS
                }
                onChange={(e) => {
                  void handleSelectPhotos(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
              <p className="text-xs text-muted-foreground">
                {uploadingPhoto
                  ? "Uploading…"
                  : `Up to ${MAX_PHOTOS} photos. The cover photo is the one shown in listings; the rest only appear on this item's detail page.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" variant="gold" disabled={busy}>
                {busy ? "Saving..." : "Save equipment"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type EnquiryQuickFilter =
  | "all"
  | "new_today"
  | "awaiting"
  | "follow_up"
  | "closing";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(value: string | null) {
  if (!value) return false;
  return isSameDay(new Date(value), new Date());
}

function isOverdueFollowUp(value: string | null) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) < today;
}

function EnquiriesPanel({
  enquiries,
  users,
  preview = false,
  onSaved,
  canManage = true,
  initialQuickFilter = "all",
}: {
  enquiries: Enquiry[];
  users: UserProfile[];
  preview?: boolean;
  onSaved: () => void;
  canManage?: boolean;
  initialQuickFilter?: EnquiryQuickFilter;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);
  const [quickFilter, setQuickFilter] =
    useState<EnquiryQuickFilter>(initialQuickFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const matchesQuickFilter = (e: Enquiry) => {
    switch (quickFilter) {
      case "new_today":
        return e.status === "new" && isToday(e.created_at);
      case "awaiting":
        return e.status === "new" && !isToday(e.created_at);
      case "follow_up":
        return (
          !!e.next_action_date &&
          (isToday(e.next_action_date) || isOverdueFollowUp(e.next_action_date))
        );
      case "closing":
        return ["quoted", "won", "lost"].includes(e.status);
      default:
        return true;
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (!matchesQuickFilter(e)) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (
      serviceTypeFilter !== "all" &&
      (e.service_type ?? "equipment_rental") !== serviceTypeFilter
    )
      return false;
    if (assigneeFilter === "unassigned" && e.assigned_to) return false;
    if (
      assigneeFilter !== "all" &&
      assigneeFilter !== "unassigned" &&
      e.assigned_to !== assigneeFilter
    )
      return false;
    return true;
  });

  const hasActiveFilters =
    quickFilter !== "all" ||
    statusFilter !== "all" ||
    assigneeFilter !== "all" ||
    serviceTypeFilter !== "all";

  function clearFilters() {
    setQuickFilter("all");
    setStatusFilter("all");
    setAssigneeFilter("all");
    setServiceTypeFilter("all");
  }

  async function addEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) {
      toast.info("Preview mode does not save changes.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("enquiry_full_name") ?? "").trim();
    const phone = String(form.get("enquiry_phone") ?? "").trim();
    if (fullName.length < 2 || phone.length < 7) {
      toast.error("Customer name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      await createEnquiry({
        full_name: fullName,
        phone,
        email: String(form.get("enquiry_email") ?? "").trim() || null,
        company: String(form.get("enquiry_company") ?? "").trim() || null,
        equipment_name:
          String(form.get("enquiry_equipment") ?? "").trim() || null,
        project_location:
          String(form.get("enquiry_location") ?? "").trim() || null,
        rental_period: String(form.get("enquiry_period") ?? "").trim() || null,
        message: String(form.get("enquiry_message") ?? "").trim() || null,
      });
      event.currentTarget.reset();
      setShowForm(false);
      onSaved();
      toast.success("Enquiry added and customer record created.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add enquiry.",
      );
    } finally {
      setSaving(false);
    }
  }

  function exportRows() {
    const rows = filteredEnquiries.map(
      ({
        reference,
        full_name,
        phone,
        email,
        company,
        equipment_name,
        transaction_type,
        preferred_contact,
        start_date,
        end_date,
        duration_days,
        quantity,
        status,
        outcome,
        assigned_to,
        next_action_date,
        created_at,
      }) => ({
        Reference: reference,
        Name: full_name,
        Phone: phone,
        Email: email,
        Company: company,
        Equipment: equipment_name,
        Type: transaction_type,
        "Contact Method": preferred_contact,
        "Rental Start": start_date,
        "Rental End": end_date,
        "Duration (days)": duration_days,
        Quantity: quantity,
        Status: status,
        Outcome: outcome || 'Pending',
        "Assigned to":
          users.find((u) => u.id === assigned_to)?.full_name ?? "Unassigned",
        "Next action": next_action_date ?? "",
        Created: created_at,
      }),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Enquiries",
    );
    XLSX.writeFile(workbook, "trans-weri-enquiries.xlsx");
  }
  async function status(id: string, value: string) {
    if (!canManage) {
      toast.error("You don't have permission to update enquiries");
      return;
    }
    try {
      await updateEnquiry(id, { status: value });
      toast.success("Enquiry status updated");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update status",
      );
    }
  }
  async function handleOutcomeChange(id: string, value: string) {
    if (!canManage) {
      toast.error("You don't have permission to update enquiries");
      return;
    }
    try {
      await updateEnquiry(id, { outcome: value });
      toast.success("Enquiry outcome updated");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update outcome",
      );
    }
  }
  async function handleAssigneeChange(id: string, userId: string) {
    if (!canManage) {
      toast.error("You don't have permission to update enquiries");
      return;
    }
    try {
      await updateEnquiry(id, { assigned_to: userId || null });
      toast.success("Enquiry assigned");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not assign enquiry",
      );
    }
  }
  async function handleNextActionChange(id: string, value: string) {
    if (!canManage) {
      toast.error("You don't have permission to update enquiries");
      return;
    }
    try {
      await updateEnquiry(id, { next_action_date: value || null });
      toast.success("Follow-up date updated");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not set follow-up date",
      );
    }
  }
  async function deleteEnquiry(id: string) {
    if (!canManage) {
      toast.error("You don't have permission to delete enquiries");
      return;
    }
    try {
      await deleteEnquiryRecord(id);
      toast.success("Enquiry deleted");
      onSaved();
    } catch (error) {
      toast.error("Could not delete enquiry");
    }
  }
  return (
    <section className="mt-8">
      <div className="flex justify-end gap-3">
        {canManage && (
          <Button variant="gold" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" /> Add enquiry
          </Button>
        )}
        <Button variant="outline" onClick={exportRows}>
          <FileDown className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["new_today", "New today"],
            ["awaiting", "Awaiting response"],
            ["follow_up", "Follow up due"],
            ["closing", "Quoted / Won / Lost"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setQuickFilter(value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              quickFilter === value
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">Anyone assigned</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name || u.email}
            </option>
          ))}
        </select>
        <select
          value={serviceTypeFilter}
          onChange={(e) => setServiceTypeFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">All services</option>
          {ALL_SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {serviceTypeLabel(s)}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filteredEnquiries.length} of {enquiries.length}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      {showForm && (
        <Card className="mt-5 border-enterprise-gold">
          <CardHeader>
            <CardTitle>Add enquiry &amp; customer</CardTitle>
            <p className="text-sm text-muted-foreground">
              This creates the enquiry and automatically adds or matches the
              customer.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={addEnquiry} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_full_name">Customer name *</Label>
                <Input
                  id="enquiry_full_name"
                  name="enquiry_full_name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_phone">Phone / WhatsApp *</Label>
                <Input
                  id="enquiry_phone"
                  name="enquiry_phone"
                  type="tel"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_email">Email</Label>
                <Input id="enquiry_email" name="enquiry_email" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_company">Company</Label>
                <Input id="enquiry_company" name="enquiry_company" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_equipment">Equipment requested</Label>
                <Input
                  id="enquiry_equipment"
                  name="enquiry_equipment"
                  placeholder="e.g. Excavator"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_location">Project location</Label>
                <Input id="enquiry_location" name="enquiry_location" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enquiry_period">Rental period</Label>
                <Input
                  id="enquiry_period"
                  name="enquiry_period"
                  placeholder="Daily, weekly, monthly"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="enquiry_message">Details</Label>
                <Textarea
                  id="enquiry_message"
                  name="enquiry_message"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? "Adding..." : "Add enquiry"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Contact Method</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Follow up</th>
                <th className="px-4 py-3">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((e) => {
                const overdue =
                  e.status === "new" && !isToday(e.created_at);
                const followUpDue =
                  !!e.next_action_date &&
                  (isToday(e.next_action_date) ||
                    isOverdueFollowUp(e.next_action_date));
                return (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{e.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.reference}
                    </p>
                    {e.status === "new" && (
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          overdue
                            ? "bg-enterprise-gold/10 text-enterprise-gold"
                            : "bg-field/10 text-field"
                        }`}
                      >
                        {overdue ? "Awaiting response" : "New today"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {e.phone}
                    <p className="text-xs text-muted-foreground">
                      {e.email ?? "No email"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {e.equipment_name ?? "General enquiry"}
                    <p className="text-xs text-muted-foreground">
                      {e.rental_period ?? "Project-based"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary">
                      {e.transaction_type || "rental"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {serviceTypeLabel(e.service_type ?? "equipment_rental")}
                  </td>
                  <td className="px-4 py-4 capitalize">
                    {e.preferred_contact ?? "—"}
                    {e.duration_days !== null && (
                      <p className="text-xs text-muted-foreground">
                        {e.duration_days} day{e.duration_days === 1 ? "" : "s"}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {e.quantity || 1}
                  </td>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={e.status}
                        disabled={
                          (ENQUIRY_STATUS_TRANSITIONS[e.status]?.length ??
                            0) <= 1
                        }
                        onChange={(event) =>
                          void status(e.id, event.target.value)
                        }
                      >
                        {(
                          ENQUIRY_STATUS_TRANSITIONS[e.status] ?? [e.status]
                        ).map((value) => (
                          <option key={value} value={value}>
                            {ENQUIRY_STATUSES.find((s) => s.value === value)
                              ?.label ?? value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        variant={e.status === "new" ? "default" : "secondary"}
                      >
                        {e.status}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={e.outcome || "pending"}
                        onChange={(event) =>
                          void handleOutcomeChange(e.id, event.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="rented">Rented</option>
                        <option value="bought">Bought</option>
                        <option value="both">Rented & Bought</option>
                        <option value="declined">Declined</option>
                      </select>
                    ) : (
                      <Badge variant="secondary">{e.outcome || "Pending"}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={e.assigned_to ?? ""}
                        onChange={(event) =>
                          void handleAssigneeChange(e.id, event.target.value)
                        }
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || u.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted-foreground">
                        {users.find((u) => u.id === e.assigned_to)
                          ?.full_name ?? "Unassigned"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {canManage ? (
                      <input
                        type="date"
                        className={`h-9 rounded-md border bg-background px-2 text-sm ${followUpDue ? "border-enterprise-gold text-enterprise-gold" : ""}`}
                        value={e.next_action_date ?? ""}
                        onChange={(event) =>
                          void handleNextActionChange(
                            e.id,
                            event.target.value,
                          )
                        }
                      />
                    ) : (
                      <span
                        className={
                          followUpDue ? "font-semibold text-enterprise-gold" : ""
                        }
                      >
                        {e.next_action_date ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <a
                        className="font-semibold text-field hover:underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/${e.phone.replace(/\D/g, "").replace(/^0/, "234")}?text=${encodeURIComponent(`Hello ${e.full_name}, this is ${site.name} regarding your enquiry ${e.reference}.`)}`}
                      >
                        Message
                      </a>
                      {canManage && (
                        <button
                          onClick={() => setPendingDelete(e)}
                          className="text-enterprise-navy hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEnquiries.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {enquiries.length === 0
                ? "No enquiries yet."
                : "No enquiries match these filters."}
            </p>
          )}
        </div>
      </Card>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete enquiry from ${pendingDelete?.full_name ?? "this customer"}?`}
        description={`This permanently removes reference ${pendingDelete?.reference ?? ""} and its history. This cannot be undone.`}
        confirmLabel="Delete enquiry"
        onConfirm={async () => {
          if (pendingDelete) await deleteEnquiry(pendingDelete.id);
        }}
      />
    </section>
  );
}

function CustomersPanel({
  customers,
  enquiries,
  onSaved,
  canManage = true,
}: {
  customers: Customer[];
  enquiries: Enquiry[];
  onSaved: () => void;
  canManage?: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  function exportCustomers() {
    const rows = customers.map(
      ({ full_name, company, phone, email, address, notes, created_at }) => ({
        Name: full_name,
        Company: company,
        Phone: phone,
        Email: email,
        Address: address,
        Notes: notes,
        Created: created_at,
      }),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Customers",
    );
    XLSX.writeFile(workbook, "trans-weri-customers.xlsx");
  }

  async function addCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("customer_full_name") ?? "").trim();
    if (fullName.length < 2) {
      toast.error("Enter the customer's full name.");
      return;
    }

    setSaving(true);
    try {
      await upsertCustomer({
        full_name: fullName,
        company: String(form.get("customer_company") ?? "").trim() || null,
        email: String(form.get("customer_email") ?? "").trim() || null,
        phone: String(form.get("customer_phone") ?? "").trim() || null,
        address: String(form.get("customer_address") ?? "").trim() || null,
        notes: String(form.get("customer_notes") ?? "").trim() || null,
      });
      event.currentTarget.reset();
      onSaved();
      toast.success("Customer added.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add customer.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function deleteCustomer(id: string) {
    if (!canManage) {
      toast.error("You don't have permission to delete customers");
      return;
    }
    try {
      await deleteCustomerRecord(id);
      toast.success("Customer deleted");
      onSaved();
    } catch (error) {
      toast.error("Could not delete customer");
    }
  }

  return (
    <section className="mt-8">
      {canManage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCustomer} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_full_name">Full name *</Label>
              <Input
                id="customer_full_name"
                name="customer_full_name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_company">Company</Label>
              <Input id="customer_company" name="customer_company" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Phone / WhatsApp</Label>
              <Input id="customer_phone" name="customer_phone" type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Email</Label>
              <Input id="customer_email" name="customer_email" type="email" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="customer_address">Address</Label>
              <Input id="customer_address" name="customer_address" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="customer_notes">Notes</Label>
              <Textarea id="customer_notes" name="customer_notes" rows={3} />
            </div>
            <Button
              type="submit"
              variant="gold"
              className="w-fit"
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              {saving ? "Adding customer..." : "Add customer"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer database</CardTitle>
          <Button variant="outline" onClick={exportCustomers}>
            <FileDown className="h-4 w-4" /> Export Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-md border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{customer.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.company ?? "Independent client"}
                    </p>
                    <p className="mt-3 text-sm">{customer.phone ?? "No phone"}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email ?? "No email"}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => setPendingDelete(customer)}
                      className="text-enterprise-navy hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <Badge variant="secondary">
                    {enquiries.filter(e => e.customer_id === customer.id).length} enquiries
                  </Badge>
                  <Badge variant="secondary">
                    {enquiries.filter(e => e.customer_id === customer.id && e.outcome === 'rented').length} rented
                  </Badge>
                  <Badge variant="secondary">
                    {enquiries.filter(e => e.customer_id === customer.id && e.outcome === 'bought').length} bought
                  </Badge>
                </div>
              </div>
            ))}
            {!customers.length && (
              <p className="text-sm text-muted-foreground">
                Customers are created as enquiries are qualified.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.full_name ?? "this customer"}?`}
        description="This permanently removes the customer record. Their past enquiries will remain but will no longer be linked to a customer profile. This cannot be undone."
        confirmLabel="Delete customer"
        onConfirm={async () => {
          if (pendingDelete) await deleteCustomer(pendingDelete.id);
        }}
      />
    </section>
  );
}

const CHART_COLORS = {
  navy: "#071a3d",
  royal: "#123e7a",
  gold: "#d4a017",
  green: "#16a34a",
  steel: "#94a3b8",
  teal: "#0d9488",
  violet: "#7c3aed",
  amber: "#f59e0b",
  rose: "#e11d48",
};

/** Cycled to give each service line a distinct colour on the pie chart —
 * there are 8 service types, more than the number of named brand colours. */
const SERVICE_CHART_PALETTE = [
  CHART_COLORS.royal,
  CHART_COLORS.gold,
  CHART_COLORS.green,
  CHART_COLORS.teal,
  CHART_COLORS.violet,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
  CHART_COLORS.steel,
];

const PIPELINE_STAGES = ["new", "contacted", "quoted", "won", "lost"] as const;

/** Last 6 calendar months as {key: "2026-04", label: "Apr"}, oldest first —
 * used to bucket created_at timestamps into monthly trend points. */
function lastSixMonths() {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-GB", { month: "short" }),
    });
  }
  return out;
}

function AnalyticsPanel({
  equipment,
  enquiries,
  customers,
}: {
  equipment: Equipment[];
  enquiries: Enquiry[];
  customers: Customer[];
}) {
  const totalUnits = equipment.reduce((n, e) => n + e.total_units, 0);
  const availableUnits = equipment.reduce((n, e) => n + e.available_units, 0);
  const activeRentals = equipment.reduce((n, e) => n + e.rented_units, 0);
  const maintenanceUnits = equipment.reduce(
    (n, e) => n + e.maintenance_units,
    0,
  );
  const wonEnquiries = enquiries.filter((e) => e.status === "won");
  const revenueNgn = wonEnquiries
    .filter((e) => e.currency !== "USD")
    .reduce((n, e) => n + (e.total_value ?? 0), 0);
  const revenueUsd = wonEnquiries
    .filter((e) => e.currency === "USD")
    .reduce((n, e) => n + (e.total_value ?? 0), 0);
  const quotationsCount = enquiries.filter((e) => e.status === "quoted").length;
  const pendingCount = enquiries.filter((e) => e.status === "new").length;
  const closedCount = enquiries.filter((e) =>
    ["won", "lost"].includes(e.status),
  ).length;
  const conversionRate = closedCount
    ? Math.round((wonEnquiries.length / closedCount) * 100)
    : 0;

  const serviceLineData = useMemo(() => {
    const counts = new Map<string, number>(
      ALL_SERVICE_TYPES.map((type) => [type, 0]),
    );
    for (const e of enquiries) {
      const type = e.service_type ?? "equipment_rental";
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return ALL_SERVICE_TYPES.map((type, index) => ({
      name: serviceTypeLabel(type),
      value: counts.get(type) ?? 0,
      fill: SERVICE_CHART_PALETTE[index % SERVICE_CHART_PALETTE.length],
    }));
  }, [enquiries]);
  const activeServiceLines = serviceLineData.filter((s) => s.value > 0).length;

  const kpis = [
    ["Total equipment", totalUnits, Package, CHART_COLORS.navy],
    ["Active rentals", activeRentals, Truck, CHART_COLORS.royal],
    [
      "Revenue (won deals)",
      formatDualCurrency(revenueNgn, revenueUsd),
      DollarSign,
      CHART_COLORS.gold,
    ],
    ["Customers", customers.length, Users, CHART_COLORS.green],
    [
      "Active service lines",
      `${activeServiceLines}/${ALL_SERVICE_TYPES.length}`,
      Briefcase,
      CHART_COLORS.teal,
    ],
    ["Quotations", quotationsCount, FileText, CHART_COLORS.royal],
    ["Pending inquiries", pendingCount, Send, CHART_COLORS.gold],
    ["Maintenance requests", maintenanceUnits, Wrench, CHART_COLORS.steel],
    ["Conversion rate", `${conversionRate}%`, Percent, CHART_COLORS.green],
  ] as const;

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    equipment.forEach((e) =>
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1),
    );
    return Array.from(counts.entries()).map(([category, count]) => ({
      category: categoryLabel(category),
      count,
    }));
  }, [equipment]);

  const statusData = [
    { name: "Available", value: availableUnits, fill: CHART_COLORS.green },
    { name: "Rented out", value: activeRentals, fill: CHART_COLORS.royal },
    {
      name: "Maintenance",
      value: maintenanceUnits,
      fill: CHART_COLORS.steel,
    },
  ].filter((d) => d.value > 0);

  const pipelineData = PIPELINE_STAGES.map((status) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count: enquiries.filter((e) => e.status === status).length,
  }));

  const months = lastSixMonths();
  const enquiryTrend = months.map((m) => ({
    label: m.label,
    Enquiries: enquiries.filter((e) => e.created_at.startsWith(m.key)).length,
  }));
  const customerGrowth = months.map((m) => ({
    label: m.label,
    Customers: customers.filter((c) => c.created_at.startsWith(m.key)).length,
  }));

  function exportAnalytics() {
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([
        { Metric: "Total equipment", Value: totalUnits },
        { Metric: "Available units", Value: availableUnits },
        { Metric: "Active rentals", Value: activeRentals },
        { Metric: "Maintenance requests", Value: maintenanceUnits },
        { Metric: "Revenue, won deals (NGN)", Value: revenueNgn },
        { Metric: "Revenue, won deals (USD)", Value: revenueUsd },
        { Metric: "Quotations", Value: quotationsCount },
        { Metric: "Pending inquiries", Value: pendingCount },
        { Metric: "Conversion rate (%)", Value: conversionRate },
        { Metric: "Customers", Value: customers.length },
        {
          Metric: "Active service lines",
          Value: `${activeServiceLines}/${ALL_SERVICE_TYPES.length}`,
        },
      ]),
      "Summary",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        serviceLineData.map((d) => ({
          "Service line": d.name,
          Enquiries: d.value,
        })),
      ),
      "Enquiries by service line",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        categoryData.map((d) => ({ Category: d.category, Units: d.count })),
      ),
      "Equipment by category",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        pipelineData.map((d) => ({ Stage: d.status, Count: d.count })),
      ),
      "Enquiry pipeline",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        months.map((m, i) => ({
          Month: m.label,
          Enquiries: enquiryTrend[i]?.Enquiries ?? 0,
          "New customers": customerGrowth[i]?.Customers ?? 0,
        })),
      ),
      "6-month trend",
    );
    XLSX.writeFile(workbook, "trans-weri-analytics.xlsx");
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-enterprise-royal/30 bg-enterprise-royal/5 p-4 text-sm text-muted-foreground">
        <p>
          Built entirely from your real equipment, enquiry and customer
          records — no estimated figures. Project tracking and quotation
          documents aren&apos;t modules yet, so project-progress analytics
          aren&apos;t available here.
        </p>
        <Button variant="outline" onClick={exportAnalytics}>
          <FileDown className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([label, value, Icon, color]) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}1A`, color }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Enquiries by service line
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={serviceLineData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {serviceLineData
                    .filter((d) => d.value > 0)
                    .map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment by category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill={CHART_COLORS.royal} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fleet status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enquiry pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill={CHART_COLORS.gold} radius={4} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Conversion rate (won ÷ closed): {conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Enquiries &amp; customer growth (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  type="category"
                  allowDuplicatedCategory={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend />
                <Line
                  data={enquiryTrend}
                  dataKey="Enquiries"
                  stroke={CHART_COLORS.royal}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  data={customerGrowth}
                  dataKey="Customers"
                  stroke={CHART_COLORS.green}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function UsersPanel({
  users,
  currentUser,
  viewerIsSuperAdmin = false,
  onSaved,
}: {
  users: UserProfile[];
  currentUser?: string | undefined;
  viewerIsSuperAdmin?: boolean;
  onSaved: () => void;
}) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("staff");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserProfile | null>(null);
  const [pendingRole, setPendingRole] = useState<{
    user: UserProfile;
    role: string;
    hasRole: boolean;
  } | null>(null);
  const [pendingPasswordReset, setPendingPasswordReset] = useState<UserProfile | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // An admin (not super_admin) never sees that super_admin exists — not in
  // the role picker, the permissions legend, or the user list. Enforced
  // again at the database level (see the super_admin_content_and_visibility
  // migration); this is the matching UI so admins don't even see a row for
  // an account they couldn't act on anyway.
  const visibleRoles = viewerIsSuperAdmin
    ? ALL_ROLES
    : ALL_ROLES.filter((role) => role !== "super_admin");
  const visibleUsers = viewerIsSuperAdmin
    ? users
    : users.filter((user) => !user.roles.includes("super_admin"));

  async function addUser() {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Email and password are required");
      return;
    }
    if (newUserPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      // The account is created directly with the password given here —
      // already confirmed, no Supabase verification email or invite link.
      await createUserAccount({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserName,
        role: newUserRole,
      });

      toast.success("Account created — they can sign in right away.");

      setShowAddUser(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("staff");
      onSaved();
    } catch (error) {
      console.error("Create user error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not create account",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleRole(userId: string, role: string, hasRole: boolean) {
    try {
      if (hasRole) {
        await removeRole(userId, role);
        toast.success(`Removed ${role} role`);
      } else {
        await assignRole(userId, role);
        toast.success(`Added ${role} role`);
      }
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update role",
      );
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      onSaved();
    } catch (error) {
      console.error("User deletion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not delete user",
      );
    }
  }

  async function handleResetPassword() {
    if (!pendingPasswordReset) return;
    if (resetPasswordValue.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResettingPassword(true);
    try {
      await resetUserPassword(pendingPasswordReset.id, resetPasswordValue);
      toast.success(
        `Password changed for ${pendingPasswordReset.full_name || pendingPasswordReset.email}`,
      );
      setPendingPasswordReset(null);
      setResetPasswordValue("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not reset password"));
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex justify-end">
        <Button variant="gold" onClick={() => setShowAddUser(!showAddUser)}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {showAddUser && (
        <Card className="mt-5 border-enterprise-gold">
          <CardHeader>
            <CardTitle>Create new user</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set their email and password here — the account is active
              immediately, no confirmation email required.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addUser(); }} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new_user_email">Email *</Label>
                <Input
                  id="new_user_email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_user_name">Full name</Label>
                <Input
                  id="new_user_name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_user_password">Password *</Label>
                <Input
                  id="new_user_password"
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_user_role">Role *</Label>
                <select
                  id="new_user_role"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                >
                  {visibleRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" variant="gold" disabled={busy}>
                  {busy ? "Creating account..." : "Create account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Roles &amp; permissions</CardTitle>
          <p className="text-sm text-muted-foreground">
            What each role can do — assign roles to users in the table below.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  {ALL_PERMISSIONS.map((permission) => (
                    <th key={permission} className="px-4 py-3 text-center">
                      {PERMISSION_LABELS[permission]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRoles.map((role) => (
                  <tr key={role} className="border-t">
                    <td className="px-4 py-3 font-semibold">
                      {roleLabel(role)}
                    </td>
                    {ALL_PERMISSIONS.map((permission) => (
                      <td key={permission} className="px-4 py-3 text-center">
                        {ROLE_PERMISSIONS[role][permission] ? (
                          <Check className="mx-auto h-4 w-4 text-field" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img
              src={site.logo}
              alt=""
              className="h-9 w-9 shrink-0 rounded-md bg-background object-contain p-1 ring-1 ring-border"
            />
            <div>
              <CardTitle>User management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage users and their access roles
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-4">
                      <p className="font-semibold">{user.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.id === currentUser ? "(You)" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <Badge variant="secondary">No roles</Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={role} variant="default">
                              {roleLabel(role)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {visibleRoles.map((role) => (
                          <Button
                            key={role}
                            size="sm"
                            variant={
                              user.roles.includes(role) ? "default" : "outline"
                            }
                            onClick={() =>
                              setPendingRole({
                                user,
                                role,
                                hasRole: user.roles.includes(role),
                              })
                            }
                            disabled={
                              user.id === currentUser &&
                              (role === "admin" || role === "super_admin")
                            }
                          >
                            {user.roles.includes(role) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}{" "}
                            {roleLabel(role)}
                          </Button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPendingPasswordReset(user);
                          setResetPasswordValue("");
                        }}
                      >
                        <Lock className="h-4 w-4" /> Reset
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      {user.id !== currentUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPendingDelete(user)}
                          className="text-enterprise-navy hover:text-enterprise-navy"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!visibleUsers.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No users found. Create the first user to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.full_name || pendingDelete?.email || "this user"}?`}
        description="This removes their access and roles immediately and cannot be undone. They will need a new invitation to regain access."
        confirmLabel="Delete user"
        onConfirm={async () => {
          if (pendingDelete) await handleDeleteUser(pendingDelete.id);
        }}
      />
      <ConfirmDialog
        open={!!pendingRole}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title={
          pendingRole
            ? `${pendingRole.hasRole ? "Remove" : "Grant"} ${roleLabel(pendingRole.role)} role ${pendingRole.hasRole ? "from" : "to"} ${pendingRole.user.full_name || pendingRole.user.email}?`
            : ""
        }
        description={
          pendingRole?.role === "admin" || pendingRole?.role === "super_admin"
            ? "Admins can manage users, roles, equipment, enquiries, customers and site content — the highest level of access."
            : "This changes what this person can see and do in the admin console."
        }
        confirmLabel={pendingRole?.hasRole ? "Remove role" : "Grant role"}
        destructive={!!pendingRole?.hasRole}
        onConfirm={async () => {
          if (pendingRole) {
            await toggleRole(
              pendingRole.user.id,
              pendingRole.role,
              pendingRole.hasRole,
            );
          }
        }}
      />
      <Dialog
        open={!!pendingPasswordReset}
        onOpenChange={(open) => {
          if (!open) {
            setPendingPasswordReset(null);
            setResetPasswordValue("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reset password for{" "}
              {pendingPasswordReset?.full_name || pendingPasswordReset?.email}
            </DialogTitle>
            <DialogDescription>
              They&apos;ll need to sign in with this new password right away —
              share it with them directly.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleResetPassword();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="reset_password_value">New password</Label>
              <Input
                id="reset_password_value"
                type="text"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingPasswordReset(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={resettingPassword}>
                {resettingPassword ? "Changing..." : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
