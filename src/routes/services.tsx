import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building,
  Globe,
  Package,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { site } from "@/lib/site";
import headerBanner from "@/assests/header-banner.webp";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Our Services | ${site.name}` },
      {
        name: "description",
        content: `${site.name}'s full scope of services: heavy equipment rental & sales, energy & petroleum products, general trading, import & export, logistics, construction and management consultancy.`,
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Wrench,
    title: "Heavy Equipment Rental & Sales",
    body: "Excavators, bulldozers, wheel loaders, cranes, dump trucks, generators and dredging equipment for rent or sale across Bayelsa State and the wider Niger Delta.",
    cta: { label: "Browse equipment", to: "/equipment" as const },
  },
  {
    icon: Zap,
    title: "Energy & Petroleum",
    body: "Commercial sourcing, storage, transportation, sale and distribution of crude oil, natural gas, petroleum and petroleum-derived products, within approved regulatory scope.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
  {
    icon: Package,
    title: "General Trading",
    body: "General trading, procurement, wholesale and retail dealing in goods, materials, commodities and merchandise, as principal or agent.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
  {
    icon: Globe,
    title: "Import & Export",
    body: "Domestic and international sourcing, import and export coordination, and commercial documentation support across the trading cycle.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
  {
    icon: Truck,
    title: "Logistics & Distribution",
    body: "Movement, distribution, storage and handling support aligned with trading and energy-related supply chains, from supplier to project site.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
  {
    icon: Building,
    title: "Construction & General Contracting",
    body: "General building and construction contracting, procurement and coordination of project materials, and contract execution with specialist vendors.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
  {
    icon: Briefcase,
    title: "Management Consultancy",
    body: "Business and management advisory, commercial and operational improvement support, and tailored assignments based on client requirements.",
    cta: { label: "Enquire", to: "/contact" as const },
  },
] as const;

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero-gradient pt-14 pb-20 sm:pt-16">
        <img
          src={headerBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              What we do
            </p>
          </div>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight text-primary-foreground sm:text-6xl">
            A diversified platform for{" "}
            <span className="text-sky-400">supply, projects and trade.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
            {site.name} operates across general trading, energy &amp;
            petroleum products, logistics, construction, management
            consultancy and heavy equipment rental — a single, responsive
            commercial platform for clients, contractors and partners.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, body, cta }) => (
            <article
              key={title}
              className="flex flex-col border-t-4 border-brand bg-card p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-3 flex-1 text-muted-foreground">{body}</p>
              <Link
                to={cta.to}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-sky-600"
              >
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
