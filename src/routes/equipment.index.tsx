import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { fetchEquipmentCategories, fetchEquipmentList } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import heroImage from "@/assests/header-banner.webp";

type EquipmentSearch = { category?: string | undefined };

type SortOption = "featured" | "price_low" | "price_high" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

function primaryPrice(e: { for_rent: boolean; for_sale: boolean; daily_rate: number | null; sale_price: number | null }) {
  if (e.for_rent && e.daily_rate !== null) return e.daily_rate;
  if (e.for_sale && e.sale_price !== null) return e.sale_price;
  return Number.POSITIVE_INFINITY;
}

export const Route = createFileRoute("/equipment/")({
  validateSearch: (search: Record<string, unknown>): EquipmentSearch => ({
    category:
      typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Equipment for Rent | Trans Weri Gulf Limited" },
      {
        name: "description",
        content:
          "Browse excavators, bulldozers, wheel loaders, motor graders, cranes, dump trucks and generators available for daily, weekly and monthly rental in Bayelsa State.",
      },
      {
        property: "og:title",
        content: "Equipment for Rent | Trans Weri Gulf Limited",
      },
      {
        property: "og:description",
        content:
          "Full heavy plant rental catalogue with rates, specifications and live availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipmentIndex,
});

function EquipmentIndex() {
  const scope = useScrollReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { category } = Route.useSearch();
  const [term, setTerm] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "rental" | "sale">("all");
  const [sort, setSort] = useState<SortOption>("featured");

  const { data, error, isLoading } = useQuery({
    queryKey: ["equipment", "public"],
    queryFn: fetchEquipmentList,
  });

  // Admins often edit prices/stock in the dashboard while the public site is
  // open in a separate tab — that tab's query cache never hears about it, so
  // it would otherwise keep showing stale data until the visitor reloads.
  useEffect(() => {
    const channel = supabase
      .channel("equipment-index-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["equipment", "public"],
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
  const { data: categories } = useQuery({
    queryKey: ["equipment-categories"],
    queryFn: fetchEquipmentCategories,
  });
  const categoryList = categories ?? CATEGORIES;

  const items = useMemo(() => {
    let list = data ?? [];
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
    list = [...list];
    if (sort === "price_low") {
      list.sort((a, b) => primaryPrice(a) - primaryPrice(b));
    } else if (sort === "price_high") {
      list.sort((a, b) => primaryPrice(b) - primaryPrice(a));
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [data, category, term, onlyAvailable, filterType, sort]);

  function setCategory(value?: string) {
    navigate({ to: "/equipment", search: value ? { category: value } : {} });
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero-gradient pt-14 pb-16 sm:pt-16">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Equipment catalogue
          </p>
          <h1 className="mt-3 text-4xl text-primary-foreground sm:text-5xl">
            Heavy equipment for rent or sale
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">
            Daily, weekly and monthly rental rates or purchase options. Operated or bare rental. Delivered
            anywhere in Bayelsa State and the wider Niger Delta.
          </p>
        </div>
      </section>

      <div ref={scope} className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
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
            variant="outline"
            onClick={() => setOnlyAvailable((v) => !v)}
            className={cn(
              onlyAvailable &&
                "border-transparent bg-gradient-to-r from-sky-500 to-sky-400 text-white hover:brightness-110",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Available only
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs lg:w-52"
            aria-label="Sort equipment"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All Equipment
            </Button>
            <Button
              variant={filterType === "rental" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("rental")}
            >
              For Rent
            </Button>
            <Button
              variant={filterType === "sale" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("sale")}
            >
              For Sale
            </Button>
          </div>
          {!isLoading && !error && (
            <p className="text-sm font-medium text-muted-foreground">
              Showing <span className="text-foreground">{items.length}</span>{" "}
              of {data?.length ?? 0} machines
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              !category
                ? "border-transparent bg-gradient-to-r from-sky-500 to-sky-400 text-white"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            All ({data?.length ?? 0})
          </button>
          {categoryList.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                category === c.value
                  ? "border-transparent bg-gradient-to-r from-sky-500 to-sky-400 text-white"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-16 text-center text-signal">
            We could not load the fleet right now. Please refresh or contact us
            on WhatsApp.
          </p>
        ) : isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <PackageSearch className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-foreground">
                No machines match this filter
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another category, clear your search, or tell us what you
                need directly.
              </p>
            </div>
            <Button asChild className="mt-1 bg-gradient-to-r from-sky-500 to-sky-400 text-white hover:brightness-110">
              <a
                href={whatsappLink(
                  `Hello ${site.name}, I'm looking for equipment I couldn't find on your site.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Ask us on WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div key={item.id} data-reveal data-reveal-delay={(i % 3) * 0.06}>
                <EquipmentCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
