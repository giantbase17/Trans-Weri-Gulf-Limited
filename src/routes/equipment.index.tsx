import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { fetchEquipmentList } from "@/lib/db";
import { CATEGORIES } from "@/lib/site";
import { cn } from "@/lib/utils";

type EquipmentSearch = { category?: string | undefined };

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
  const { category } = Route.useSearch();
  const [term, setTerm] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "rental" | "sale">("all");

  const { data, error, isLoading } = useQuery({
    queryKey: ["equipment", "public"],
    queryFn: fetchEquipmentList,
  });

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
    return list;
  }, [data, category, term, onlyAvailable, filterType]);

  function setCategory(value?: string) {
    navigate({ to: "/equipment", search: value ? { category: value } : {} });
  }

  return (
    <SiteLayout>
      <section className="bg-hero-gradient pt-14 pb-16 sm:pt-16 grain-overlay">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">
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
            variant={onlyAvailable ? "field" : "outline"}
            onClick={() => setOnlyAvailable((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Available only
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              !category
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            All ({data?.length ?? 0})
          </button>
          {CATEGORIES.map((c) => (
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

        {error ? (
          <p className="mt-16 text-center text-signal">
            We could not load the fleet right now. Please refresh or contact us
            on WhatsApp.
          </p>
        ) : isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No machines match this filter. Try another category or contact us
            directly.
          </p>
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
