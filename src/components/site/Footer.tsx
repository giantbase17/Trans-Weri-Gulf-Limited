import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, site } from "@/lib/site";
import { fetchSiteSettings } from "@/lib/db";

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });
  const companyName = settings?.company_name ?? site.name;
  const email = settings?.email ?? site.email;
  const phone = settings?.phone ?? site.phone;
  const address = settings?.address ?? site.address;
  return (
    <footer className="bg-brand-deep text-primary-foreground">
      <div className="hazard-stripe h-1 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src={settings?.logo_url ?? site.logo}
            alt={`${companyName} logo`}
            className="h-14 w-auto rounded bg-background p-2"
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
              className="rounded-md border border-primary-foreground/20 p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={settings?.instagram_url ?? site.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-md border border-primary-foreground/20 p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-signal">
            Fleet
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {CATEGORIES.filter((c) => c.value !== "others").map((c) => (
              <li key={c.value}>
                <Link
                  to="/equipment"
                  search={{ category: c.value }}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-signal">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li>
              <Link to="/about" className="hover:text-primary-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/equipment" className="hover:text-primary-foreground">
                Browse Equipment
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary-foreground">
                Contact &amp; Enquiries
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-primary-foreground">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-signal">
            Reach Us
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-field" />
              <span>{address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-field" />
              <a
                href={`tel:${phone}`}
                className="hover:text-primary-foreground"
              >
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-field" />
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

      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} {companyName}. RC registered in Nigeria.
        All rights reserved.
      </div>
    </footer>
  );
}
