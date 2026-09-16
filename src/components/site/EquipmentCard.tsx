import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff, MapPin, Tag } from "lucide-react";
import type { Equipment } from "@/lib/db";
import { categoryLabel, equipmentImageUrl, formatDualCurrency } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  available: "bg-field text-field-foreground",
  rented: "bg-signal text-signal-foreground",
  maintenance: "bg-secondary text-secondary-foreground",
  unavailable: "bg-muted text-muted-foreground",
};

export function EquipmentCard({ item }: { item: Equipment }) {
  const showBothPrices = item.for_rent && item.for_sale && item.sale_price;

  return (
    <Link
      to="/equipment/$slug"
      params={{ slug: item.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/40 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {equipmentImageUrl(item.primary_image_url) ? (
          <img
            src={equipmentImageUrl(item.primary_image_url) ?? undefined}
            alt={item.name}
            loading="lazy"
            className="equipment-photo h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs font-medium">No photo yet</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm",
            statusStyles[item.status] ?? statusStyles["unavailable"],
          )}
        >
          {item.status === "available"
            ? `${item.available_units} available`
            : item.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Tag className="h-3 w-3" />
            {categoryLabel(item.category)}
          </span>
          {item.for_rent && (
            <Badge
              variant="default"
              className="text-[11px] uppercase tracking-wider bg-field text-field-foreground"
            >
              For Rent
            </Badge>
          )}
          {item.for_sale && (
            <Badge
              variant="default"
              className="text-[11px] uppercase tracking-wider bg-signal text-signal-foreground"
            >
              For Sale
            </Badge>
          )}
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-brand">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
            <div
              className={cn(
                "min-w-0 flex-1",
                showBothPrices && "grid grid-cols-2 gap-3",
              )}
            >
              {item.for_rent && (
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.quote_only ? "Rental" : "Daily rate"}
                  </p>
                  <p
                    className={cn(
                      "truncate font-bold text-brand",
                      showBothPrices ? "text-sm sm:text-base" : "text-lg",
                    )}
                  >
                    {item.quote_only
                      ? "Request quote"
                      : formatDualCurrency(item.daily_rate, item.daily_rate_usd)}
                  </p>
                </div>
              )}
              {item.for_sale && item.sale_price && (
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Sale price
                  </p>
                  <p
                    className={cn(
                      "truncate font-bold text-signal",
                      showBothPrices ? "text-sm sm:text-base" : "text-lg",
                    )}
                  >
                    {formatDualCurrency(item.sale_price, item.sale_price_usd)}
                  </p>
                </div>
              )}
              {!item.for_rent && !item.for_sale && (
                <p className="text-sm text-muted-foreground">
                  Contact for pricing
                </p>
              )}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-brand transition-colors group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-sky-400 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
