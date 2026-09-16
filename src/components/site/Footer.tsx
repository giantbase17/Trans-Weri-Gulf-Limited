import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Truck,
} from "lucide-react";
import { CATEGORIES, site } from "@/lib/site";
import { fetchEquipmentCategories, fetchSiteSettings } from "@/lib/db";
import footerBanner from "@/assests/footer-banner.webp";

function IconBadge({ icon: Icon }: { icon: typeof Truck }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/40 text-sky-400">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });
  const { data: categories } = useQuery({
    queryKey: ["equipment-categories"],
    queryFn: fetchEquipmentCategories,
  });
  const categoryList = categories ?? CATEGORIES;
  const companyName = settings?.company_name ?? site.name;
  const email = settings?.email ?? site.email;
  const phone = settings?.phone ?? site.phone;
  const address = settings?.address ?? site.address;
  return (
    <footer className="relative overflow-hidden bg-brand-deep text-primary-foreground">
      <img
        src={footerBanner}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-deep via-brand-deep/95 to-brand-deep" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src={settings?.logo_url ?? site.logo}
            alt={`${companyName} logo`}
            className="h-16 w-auto max-w-[220px] rounded bg-background p-2 object-contain"
          />
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/75">
            Heavy-duty machinery and equipment rental for construction, marine,
            dredging and oil &amp; gas projects across the Niger Delta.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={settings?.facebook_url ?? site.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 transition-colors hover:bg-sky-400/10"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={settings?.instagram_url ?? site.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 transition-colors hover:bg-sky-400/10"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <IconBadge icon={Truck} />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Fleet
            </h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {categoryList.filter((c) => c.value !== "others").map((c) => (
              <li key={c.value}>
                <Link
                  to="/equipment"
                  search={{ category: c.value }}
                  className="flex items-center gap-1 transition-colors hover:text-primary-foreground"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <IconBadge icon={Building2} />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Company
            </h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li>
              <Link
                to="/about"
                className="flex items-center gap-1 hover:text-primary-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/equipment"
                className="flex items-center gap-1 hover:text-primary-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                Browse Equipment
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="flex items-center gap-1 hover:text-primary-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                Our Services
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="flex items-center gap-1 hover:text-primary-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                Contact &amp; Enquiries
              </Link>
            </li>
            <li>
              <Link
                to="/auth"
                className="flex items-center gap-1 hover:text-primary-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                Staff Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <IconBadge icon={MapPin} />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Reach Us
            </h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-3">
              <IconBadge icon={MapPin} />
              <span className="mt-1.5">{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <IconBadge icon={Phone} />
              <a
                href={`tel:${phone}`}
                className="hover:text-primary-foreground"
              >
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconBadge icon={Mail} />
              <a
                href={`mailto:${email}`}
                className="break-all hover:text-primary-foreground"
              >
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} {companyName}. RC registered in Nigeria.
        All rights reserved.
      </div>
    </footer>
  );
}
