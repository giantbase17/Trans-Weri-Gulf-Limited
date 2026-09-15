import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { fetchSiteSettings } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/equipment", label: "Equipment" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-lg font-extrabold uppercase tracking-tight text-primary sm:text-xl">
            {settings?.company_name ?? site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{
                className: "text-signal border-signal",
              }}
              className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors hover:text-signal"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${settings?.phone ?? site.phone}`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-foreground"
          >
            <Phone className="h-4 w-4 text-brand" />
            {settings?.phone ?? site.phoneDisplay}
          </a>
          <Button asChild variant="signal" size="sm">
            <a
              href={whatsappLink(
                `Hello ${site.name}, I would like to rent equipment.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-foreground lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          className={cn(
            "animate-fade-in border-t border-border bg-background px-4 pb-5 lg:hidden",
          )}
        >
          <nav className="flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-signal bg-secondary" }}
                className="rounded-md px-3 py-3 text-sm font-semibold uppercase text-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href={`tel:${settings?.phone ?? site.phone}`}
            className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-foreground"
          >
            <Phone className="h-4 w-4 text-brand" />
            {settings?.phone ?? site.phoneDisplay}
          </a>
          <Button asChild variant="signal" className="mt-2 w-full">
            <a
              href={whatsappLink(
                `Hello ${site.name}, I would like to rent equipment.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
    </header>
  );
}
