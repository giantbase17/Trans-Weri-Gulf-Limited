import logoAsset from "@/assests/company-logo.webp";

export const site = {
  name: "Trans Weri Gulf Limited",
  shortName: "Trans Weri Gulf",
  tagline:
    "Equipment rental & sales, energy & petroleum, trading, logistics, construction and consultancy — from Yenagoa, Bayelsa State",
  phoneDisplay: "070 7164 9524",
  phone: "07071649524",
  whatsapp: "2347071649524",
  email: "transwerigulflimited@gmail.com",
  address:
    "Road 101, Block B, Flat 3, Ekeki Housing Estate Phase 2, Yenagoa, Bayelsa State, Nigeria",
  addressShort: "Ekeki Housing Estate, Yenagoa",
  facebook: "https://www.facebook.com/share/1E8KaYgpQw/?mibextid=wwXIfr",
  instagram:
    "https://www.instagram.com/transwerigulflimited?igsi=Mm91M3V5ZDJ4NDV1",
  logo: logoAsset,
} as const;

export const CATEGORIES = [
  { value: "excavators", label: "Excavators" },
  { value: "bulldozers", label: "Bulldozers" },
  { value: "wheel_loaders", label: "Wheel Loaders" },
  { value: "motor_graders", label: "Motor Graders" },
  { value: "cranes", label: "Cranes" },
  { value: "dump_trucks", label: "Dump Trucks" },
  { value: "generators", label: "Generators & Power Equipment" },
  { value: "others", label: "Others" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const STATUSES = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented Out" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "unavailable", label: "Unavailable" },
] as const;

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

/**
 * New → Contacted → Quoted → Won/Lost. "Lost" is always reachable as an
 * escape hatch from any active stage; Won/Lost are terminal.
 */
export const ENQUIRY_STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ["new", "contacted", "lost"],
  contacted: ["contacted", "quoted", "lost"],
  quoted: ["quoted", "won", "lost"],
  won: ["won"],
  lost: ["lost"],
};

export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageEquipment: true,
    canManageEnquiries: true,
    canManageCustomers: true,
    canManageContent: true,
    canViewAll: true,
  },
  manager: {
    canManageUsers: false,
    canManageEquipment: true,
    canManageEnquiries: true,
    canManageCustomers: true,
    canManageContent: false,
    canViewAll: true,
  },
  staff: {
    canManageUsers: false,
    canManageEquipment: false,
    canManageEnquiries: false,
    canManageCustomers: false,
    canManageContent: false,
    canViewAll: true,
  },
  // Enterprise hierarchy — additive on top of the three roles above, not a
  // replacement. Existing admin/manager/staff assignments are untouched.
  super_admin: {
    canManageUsers: true,
    canManageEquipment: true,
    canManageEnquiries: true,
    canManageCustomers: true,
    canManageContent: true,
    canViewAll: true,
  },
  sales_manager: {
    canManageUsers: false,
    canManageEquipment: false,
    canManageEnquiries: true,
    canManageCustomers: true,
    canManageContent: false,
    canViewAll: true,
  },
  equipment_manager: {
    canManageUsers: false,
    canManageEquipment: true,
    canManageEnquiries: false,
    canManageCustomers: false,
    canManageContent: false,
    canViewAll: true,
  },
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;

/** Every assignable role, in display order — the "Create user" role picker
 * and the per-user role-toggle grid both iterate this. */
export const ALL_ROLES: Role[] = [
  "super_admin",
  "admin",
  "manager",
  "sales_manager",
  "equipment_manager",
  "staff",
];

/** Human-facing labels for the enterprise hierarchy — "manager" and "staff"
 * keep their original database values (nothing to migrate) but read as
 * "Operations Manager" / "Customer Support" anywhere a role is displayed. */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Operations Manager",
  sales_manager: "Sales Manager",
  equipment_manager: "Equipment Manager",
  staff: "Customer Support",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as Role] ?? role;
}

export type ServiceType =
  | "equipment_rental"
  | "equipment_purchase"
  | "energy_petroleum"
  | "general_trading"
  | "import_export"
  | "logistics"
  | "construction"
  | "management_consultancy";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  equipment_rental: "Equipment Rental",
  equipment_purchase: "Equipment Purchase",
  energy_petroleum: "Energy & Petroleum",
  general_trading: "General Trading",
  import_export: "Import & Export",
  logistics: "Logistics & Distribution",
  construction: "Construction & General Contracting",
  management_consultancy: "Management Consultancy",
};

export const ALL_SERVICE_TYPES = Object.keys(
  SERVICE_LABELS,
) as ServiceType[];

export function serviceTypeLabel(value: string): string {
  return SERVICE_LABELS[value as ServiceType] ?? value;
}

export function hasPermission(role: string | string[], permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  const userRoles = Array.isArray(role) ? role : [role];
  return userRoles.some(r => {
    const rolePermissions = ROLE_PERMISSIONS[r as Role];
    return rolePermissions?.[permission] === true;
  });
}

export function categoryLabel(value: string) {
  const known = CATEGORIES.find((c) => c.value === value)?.label;
  if (known) return known;
  if (!value) return "Others";
  // A category an admin added after this list was last updated — make a
  // readable label out of its raw value rather than mislabeling it.
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatNaira(value: number | null | undefined) {
  if (value === null || value === undefined) return "On request";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(value: number | null | undefined, currency: string = "NGN") {
  if (value === null || value === undefined) return "On request";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceUSD(value: number | null | undefined) {
  if (value === null || value === undefined) return "On request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDualCurrency(ngnValue: number | null, usdValue: number | null) {
  if (ngnValue === null && usdValue === null) return "On request";
  const parts = [];
  if (ngnValue !== null) {
    parts.push(formatPrice(ngnValue, "NGN"));
  }
  if (usdValue !== null) {
    parts.push(formatPriceUSD(usdValue));
  }
  return parts.join(" / ");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
const legacyEquipmentImages = import.meta.glob("../assests/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export function whatsappLinkTo(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "234");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function equipmentImageUrl(url: string | null | undefined) {
  if (!url) return null;
  if (!url.includes("/__l5e/")) return url;

  const filename = url.split("/").pop();
  if (!filename) return url;
  // Legacy seed URLs point at a filename that predates the webp
  // conversion (e.g. eq-p6_1.jpg) — match on the stem so they still
  // resolve to the current local asset (eq-p6_1.webp).
  const stem = filename.replace(/\.[^./]+$/, "");

  const localPath = Object.keys(legacyEquipmentImages).find((path) =>
    path.endsWith(`/${stem}.webp`),
  );
  return localPath ? legacyEquipmentImages[localPath] : url;
}
