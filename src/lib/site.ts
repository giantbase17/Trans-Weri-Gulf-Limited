import logoAsset from "@/assests/company-logo.jpeg";

export const site = {
  name: "Trans Weri Gulf Limited",
  shortName: "Trans Weri Gulf",
  tagline: "Heavy-duty machinery & equipment rental and sales in Yenagoa, Bayelsa State",
  phoneDisplay: "070 7164 9524",
  phone: "07071649524",
  whatsapp: "2347071649524",
  email: "transwerigulflimited@gmail.com",
  address: "No. 3 Okaka Estate, Yenagoa, Bayelsa State, Nigeria, 560211",
  addressShort: "No. 3 Okaka Estate, Yenagoa",
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
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;

export function hasPermission(role: string | string[], permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  const userRoles = Array.isArray(role) ? role : [role];
  return userRoles.some(r => {
    const rolePermissions = ROLE_PERMISSIONS[r as Role];
    return rolePermissions?.[permission] === true;
  });
}

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Others";
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
const legacyEquipmentImages = import.meta.glob("../assests/*.jpg", {
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

  const localPath = Object.keys(legacyEquipmentImages).find((path) =>
    path.endsWith(`/${filename}`),
  );
  return localPath ? legacyEquipmentImages[localPath] : url;
}
