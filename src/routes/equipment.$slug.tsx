import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  MapPin,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEquipmentBySlug, fetchEquipmentImages } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import {
  categoryLabel,
  equipmentImageUrl,
  formatNaira,
  formatDualCurrency,
  site,
  whatsappLink,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment/$slug")({
  head: ({ params }) => {
    const readable = params.slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${readable} Rental | Trans Weri Gulf Limited` },
        {
          property: "og:title",
          content: `${readable} Rental | Trans Weri Gulf Limited`,
        },
        {
          property: "og:description",
          content: `Specifications, rental rates and availability for the ${readable}.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EquipmentDetail,
});

function EquipmentDetail() {
  const { slug } = Route.useParams();
  const [active, setActive] = useState(0);
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["equipment", slug],
    queryFn: () => fetchEquipmentBySlug(slug),
  });

  // Keep this page's price/availability in sync when it's changed from the
  // admin dashboard in another tab — see equipment.index.tsx for the same
  // pattern.
  useEffect(() => {
    const channel = supabase
      .channel(`equipment-detail-live-${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["equipment", slug] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, slug]);

  const { data: images = [] } = useQuery({
    queryKey: ["equipment-images", item?.id],
    queryFn: () => fetchEquipmentImages(item!.id),
    enabled: !!item?.id,
  });

  const gallery = images.length
    ? images.map((i) => equipmentImageUrl(i.url) ?? i.url)
    : equipmentImageUrl(item?.primary_image_url)
      ? [equipmentImageUrl(item?.primary_image_url) as string]
      : [];

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6">
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </SiteLayout>
    );
  }

  if (!item) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-24 text-center sm:px-6">
          <h1 className="text-3xl">Machine not found</h1>
          <p className="mt-3 text-muted-foreground">
            This item may have been removed from the rental catalogue.
          </p>
          <Button asChild variant="signal" className="mt-6">
            <Link to="/equipment">Back to fleet</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const specs = Object.entries(item.specifications ?? {});

  return (
    <SiteLayout>
      <div className="bg-hero-gradient pt-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/equipment"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to fleet
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge className="bg-signal text-signal-foreground uppercase tracking-wider">
              {categoryLabel(item.category)}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground"
            >
              {item.status === "available"
                ? `${item.available_units} of ${item.total_units} available`
                : item.status}
            </Badge>
          </div>
          <h1 className="mt-3 text-4xl text-primary-foreground sm:text-5xl">
            {item.name}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-primary-foreground/75">
            <MapPin className="h-4 w-4 text-field" /> {item.location}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {gallery[active] ? (
              <img
                src={gallery[active]}
                alt={item.name}
                className="equipment-photo aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">
                No photo available
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    i === active
                      ? "border-signal"
                      : "border-transparent opacity-70",
                  )}
                >
                  <img
                    src={url}
                    alt=""
                    className="equipment-photo h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl">Overview</h2>
            <p className="mt-3 text-muted-foreground">{item.description}</p>
          </div>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="flex items-center gap-2 text-2xl">
                <Wrench className="h-5 w-5 text-signal" /> Specifications
              </h2>
              <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                {specs.map(([k, v]) => (
                  <div key={k} className="bg-card px-5 py-4">
                    <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-1 font-semibold">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl">Request this machine</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill the form and our rental desk will confirm availability and
              pricing.
            </p>
            <div className="mt-6">
              <EnquiryForm equipment={item} />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6 shadow-lift">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              Pricing
            </p>
            {item.quote_only ? (
              <>
                <p className="mt-3 text-2xl font-extrabold text-brand">
                  Request quote
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pricing for this unit depends on scope, duration and location.
                </p>
              </>
            ) : (
              <>
                {item.for_rent && (
                  <>
                    <p className="mt-4 text-sm font-semibold text-muted-foreground">Rental Rates</p>
                    <dl className="mt-2 space-y-3">
                      {[
                        ["Daily", item.daily_rate, item.daily_rate_usd],
                        ["Weekly", item.weekly_rate, item.weekly_rate_usd],
                        ["Monthly", item.monthly_rate, item.monthly_rate_usd],
                      ].map(([label, ngnRate, usdRate]) => (
                        <div
                          key={String(label)}
                          className="flex items-center justify-between border-b border-border pb-2"
                        >
                          <dt className="text-sm text-muted-foreground">
                            {label as string}
                          </dt>
                          <dd className="font-bold text-brand">
                            {formatDualCurrency(ngnRate as number | null, usdRate as number | null)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
                {item.for_sale && item.sale_price && (
                  <>
                    <p className="mt-4 text-sm font-semibold text-muted-foreground">Sale Price</p>
                    <p className="mt-2 text-2xl font-bold text-signal">
                      {formatDualCurrency(item.sale_price, item.sale_price_usd)}
                    </p>
                  </>
                )}
              </>
            )}

            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {[
                "Operator available on request",
                "Lowbed delivery arranged",
                "Maintenance covered",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-field" /> {t}
                </li>
              ))}
            </ul>

            <Button asChild variant="signal" className="mt-6 w-full" size="lg">
              <a
                href={whatsappLink(
                  `Hello ${site.name}, I'd like to ${item.for_sale ? 'buy' : 'rent'} the ${item.name}. Please share availability and pricing.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp Rental Desk
              </a>
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full" size="lg">
              <a href={`tel:${site.phone}`}>Call {site.phoneDisplay}</a>
            </Button>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-secondary p-4 text-sm">
              <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p className="text-muted-foreground">
                Inventory: {item.total_units} total · {item.available_units}{" "}
                available · {item.rented_units} on hire ·{" "}
                {item.maintenance_units} in maintenance.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
