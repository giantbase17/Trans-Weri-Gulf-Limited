import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock,
  Gauge,
  HardHat,
  LifeBuoy,
  MapPin,
  Newspaper,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Users,
  Weight,
} from "lucide-react";
import heroBackground from "@/assests/background.png";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { fetchEquipmentList, fetchSitePosts, type Equipment } from "@/lib/db";
import { CATEGORIES, equipmentImageUrl, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trans Weri Gulf Limited | Heavy Equipment Rental & Sales, Yenagoa" },
      {
        name: "description",
        content:
          "Rent or buy excavators, bulldozers, wheel loaders, graders, cranes, tipper trucks and generators in Yenagoa, Bayelsa State. Operated fleet, fast mobilisation, 24/7 support.",
      },
      {
        property: "og:title",
        content: "Trans Weri Gulf Limited | Heavy Equipment Rental & Sales",
      },
      {
        property: "og:description",
        content:
          "Heavy-duty machinery and equipment rental and sales for construction, dredging, marine and oil & gas projects across the Niger Delta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "Reliable equipment",
    body: "Well maintained & site ready",
  },
  {
    icon: MapPin,
    title: "Wide coverage",
    body: "Bayelsa State & wider Niger Delta",
  },
  {
    icon: Users,
    title: "Flexible terms",
    body: "Daily, weekly or monthly",
  },
] as const;

const advantages = [
  {
    icon: ShieldCheck,
    title: "Certified & Insured",
    body: "Every machine is inspected, insured and delivered with documentation ready for site audits.",
  },
  {
    icon: Clock,
    title: "Rapid Mobilisation",
    body: "Lowbed haulage from our Yenagoa yard gets heavy plant on your site within 24–72 hours.",
  },
  {
    icon: HardHat,
    title: "Skilled Operators",
    body: "Optional experienced operators and banksmen with HSE training for riverine and swamp terrain.",
  },
  {
    icon: LifeBuoy,
    title: "Maintenance Cover",
    body: "Scheduled servicing, on-call field mechanics and standby units to keep your programme moving.",
  },
];

const updates = [
  {
    type: "Company news",
    date: "03 Sep 2026",
    title: "A stronger equipment partner for Niger Delta projects",
    body: "We are expanding our mobilisation support for contractors working across Bayelsa, riverine communities and the wider Niger Delta.",
    image: "news",
  },
  {
    type: "Field notes",
    date: "28 Aug 2026",
    title: "Choosing the right machine for difficult terrain",
    body: "A practical guide to matching excavators, dozers and support equipment to access, ground conditions and programme demands.",
    image: "field",
  },
  {
    type: "Incoming equipment",
    date: "Arriving soon",
    title: "New lifting and dredging capacity on the horizon",
    body: "Ask our team about upcoming crane and dredging equipment availability so we can reserve capacity for your next project.",
    image: "incoming",
  },
] as const;

function specChips(item: Equipment): [string, string][] {
  const entries = Object.entries(item.specifications ?? {});
  const power = entries.find(([key]) => /power|engine|hp/i.test(key));
  const weight = entries.find(([key]) => /weight|capacity|ton/i.test(key));
  const chips: [string, string][] = [];
  for (const entry of [power, weight]) {
    if (entry) chips.push(entry);
  }
  for (const entry of entries) {
    if (chips.length >= 2) break;
    if (!chips.includes(entry)) chips.push(entry);
  }
  return chips.slice(0, 2);
}

function BrowseEquipmentCard({ item }: { item: Equipment }) {
  const chips = specChips(item);
  const img = equipmentImageUrl(item.primary_image_url);
  return (
    <Link
      to="/equipment/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {item.for_rent && (
            <span className="rounded-full bg-signal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-signal">
              For Rent
            </span>
          )}
          {item.for_sale && (
            <span className="rounded-full bg-field/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-field">
              For Sale
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
            {chips.map(([key, value]) => (
              <span key={key} className="flex items-center gap-1.5">
                {/power|engine|hp/i.test(key) ? (
                  <Gauge className="h-3.5 w-3.5 text-brand" />
                ) : (
                  <Weight className="h-3.5 w-3.5 text-brand" />
                )}
                {value}
              </span>
            ))}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-brand transition-colors group-hover:bg-signal group-hover:text-signal-foreground">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const scope = useScrollReveal<HTMLDivElement>();
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment", "public"],
    queryFn: fetchEquipmentList,
  });
  const { data: publishedPosts = [] } = useQuery({
    queryKey: ["site-posts", "public"],
    queryFn: () => fetchSitePosts(),
  });

  const [term, setTerm] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "rental" | "sale">("all");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const filteredEquipment = useMemo(() => {
    let list = equipment;
    if (category) list = list.filter((e) => e.category === category);
    if (onlyAvailable) list = list.filter((e) => e.status === "available");
    if (filterType === "rental") list = list.filter((e) => e.for_rent);
    if (filterType === "sale") list = list.filter((e) => e.for_sale);
    if (term.trim()) {
      const t = term.toLowerCase();
      list = list.filter((e) =>
        [e.name, e.brand, e.model, e.description]
          .join(" ")
          .toLowerCase()
          .includes(t),
      );
    }
    return list;
  }, [equipment, category, onlyAvailable, filterType, term]);

  const visibleUpdates = publishedPosts.length
    ? publishedPosts.slice(0, 6).map((post) => ({
        type:
          post.kind === "incoming"
            ? "Incoming equipment"
            : post.kind === "blog"
              ? "Field notes"
              : "Company news",
        date: post.publish_date,
        title: post.title,
        body: post.excerpt,
        image: post.kind,
        imageUrl: post.image_url,
      }))
    : updates.map((update) => ({ ...update, imageUrl: null }));

  return (
    <SiteLayout>
      <div ref={scope}>
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand-deep lg:min-h-[600px]">
          <div className="absolute inset-0">
            <img
              src={heroBackground}
              alt="Heavy equipment on a construction site at dusk"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/80 to-brand-deep/50 lg:via-brand-deep/30 lg:to-transparent" />
          </div>

          <div className="pointer-events-none absolute right-4 top-6 z-10 w-28 text-right sm:right-6">
            <p className="text-[11px] font-bold uppercase leading-tight tracking-[0.15em] text-primary-foreground drop-shadow-md">
              Strong equipment, brighter tomorrows
            </p>
            <span className="mt-2 inline-block h-0.5 w-8 bg-field" />
          </div>

          <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-14 sm:px-6 lg:min-h-[600px] lg:justify-center lg:py-16">
            <div className="max-w-xl lg:pb-4">
              <p
                data-reveal
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-field"
              >
                <span className="h-px w-6 bg-field" /> Equipment catalogue
              </p>

              <h1
                data-reveal
                data-reveal-delay={0.06}
                className="text-balance-tight mt-4 text-4xl leading-[1.05] text-primary-foreground sm:text-5xl lg:text-6xl"
              >
                Heavy equipment that keeps projects moving
              </h1>

              <p
                data-reveal
                data-reveal-delay={0.12}
                className="mt-5 max-w-xl text-base text-primary-foreground/80 sm:text-lg"
              >
                Daily, weekly and monthly rental rates or purchase options.
                Operated or bare rental. Delivered anywhere in Bayelsa State
                and the wider Niger Delta.
              </p>

              <div
                data-reveal
                data-reveal-delay={0.18}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Button asChild variant="signal" size="lg">
                  <Link to="/equipment">
                    Browse equipment <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="hero" size="lg">
                  <a href={`tel:${site.phone}`}>
                    <Phone className="h-4 w-4" /> Talk to an expert
                  </a>
                </Button>
              </div>

              <div
                data-reveal
                data-reveal-delay={0.24}
                className="mt-10 flex flex-wrap gap-x-8 gap-y-5"
              >
                {heroFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-field">
                      <f.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-primary-foreground">
                        {f.title}
                      </p>
                      <p className="text-xs text-primary-foreground/65">
                        {f.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BROWSE */}
        <section className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 pb-20 sm:-mt-8 sm:px-6">
          <div
            data-reveal
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-lift sm:p-5 lg:flex-row lg:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search machine, brand or model…"
                className="pl-9"
                maxLength={80}
              />
            </div>
            <Button
              variant={onlyAvailable ? "field" : "outline"}
              onClick={() => setOnlyAvailable((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Available only
            </Button>
          </div>

          <div data-reveal className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ["all", "All equipment"],
                ["rental", "For rent"],
                ["sale", "For sale"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  filterType === value
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div data-reveal className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(undefined)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                !category
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              All categories
            </button>
            {CATEGORIES.filter((c) => c.value !== "others").map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  category === c.value
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {filteredEquipment.length === 0 ? (
            <p className="mt-10 text-center text-muted-foreground">
              No machines match this filter yet. Try another category or
              contact us directly.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.slice(0, 6).map((item, i) => (
                <div
                  key={item.id}
                  data-reveal
                  data-reveal-delay={(i % 3) * 0.06}
                >
                  <BrowseEquipmentCard item={item} />
                </div>
              ))}
            </div>
          )}

          <div data-reveal className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link to="/equipment">
                View all equipment <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* UPDATES */}
        <section id="updates" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div
            data-reveal
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
                From the yard
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl">
                News, field notes &amp; what&apos;s next
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Keep up with company updates, useful project guidance and
                equipment joining the fleet.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/contact">
                Ask about an update <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {visibleUpdates.map((update, index) => (
              <article
                key={update.title}
                data-reveal
                data-reveal-delay={index * 0.08}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative h-48 overflow-hidden bg-brand-deep">
                  <img
                    src={
                      update.imageUrl ??
                      (update.image === "incoming"
                        ? equipmentImageUrl(equipment[2]?.primary_image_url)
                        : update.image === "field" || update.image === "blog"
                          ? equipmentImageUrl(equipment[1]?.primary_image_url)
                          : equipmentImageUrl(
                              equipment[0]?.primary_image_url,
                            )) ??
                      undefined
                    }
                    alt={update.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                    {update.image === "incoming" ? (
                      <Truck className="h-4 w-4 text-field" />
                    ) : update.image === "field" || update.image === "blog" ? (
                      <HardHat className="h-4 w-4 text-field" />
                    ) : (
                      <Newspaper className="h-4 w-4 text-field" />
                    )}
                    {update.type}
                  </span>
                </div>
                <div className="p-6">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-signal">
                    <CalendarDays className="h-3.5 w-3.5" /> {update.date}
                  </p>
                  <h3 className="mt-3 text-xl leading-tight">{update.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {update.body}
                  </p>
                  <Link
                    to="/contact"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-signal"
                  >
                    Talk to the team <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WHY US */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div
              data-track="left"
              className="relative overflow-hidden rounded-2xl"
            >
              {equipmentImageUrl(equipment[1]?.primary_image_url) && (
                <img
                  src={
                    equipmentImageUrl(equipment[1]?.primary_image_url) ??
                    undefined
                  }
                  alt="Bulldozer working on site"
                  loading="lazy"
                  className="h-[420px] w-full object-cover"
                />
              )}
              <div className="absolute bottom-5 left-5 rounded-xl bg-brand-deep/90 px-6 py-4 text-primary-foreground backdrop-blur">
                <p className="text-xs uppercase tracking-widest text-field">
                  Base yard
                </p>
                <p className="text-lg font-bold">{site.addressShort}</p>
              </div>
            </div>

            <div data-track="right">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
                Why contractors choose us
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl">
                Reliable plant. Zero downtime drama.
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {advantages.map((a) => (
                  <div key={a.title}>
                    <a.icon className="h-6 w-6 text-field" />
                    <h3 className="mt-3 text-base font-bold">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-hero-gradient py-20 grain-overlay">
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Truck data-reveal className="mx-auto h-10 w-10 text-signal" />
            <h2
              data-reveal
              className="mt-5 text-3xl text-primary-foreground sm:text-5xl"
            >
              Need a machine on site this week?
            </h2>
            <p
              data-reveal
              className="mx-auto mt-4 max-w-2xl text-primary-foreground/80"
            >
              Send us your scope and duration. We will respond with
              availability, rates and a mobilisation plan — usually within the
              hour.
            </p>
            <div
              data-reveal
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Button asChild variant="signal" size="xl">
                <Link to="/contact">Request a Quote</Link>
              </Button>
              <Button asChild variant="hero" size="xl">
                <a href={`mailto:${site.email}`}>Email Our Team</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
