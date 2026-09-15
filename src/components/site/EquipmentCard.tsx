import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Tag } from "lucide-react";
import type { Equipment } from "@/lib/db";
import { categoryLabel, equipmentImageUrl, formatNaira, formatPrice, formatDualCurrency } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  available: "bg-field text-field-foreground",
  rented: "bg-signal text-signal-foreground",
  maintenance: "bg-secondary text-secondary-foreground",
  unavailable: "bg-muted text-muted-foreground",
};

export function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <Link
      to="/equipment/$slug"
      params={{ slug: item.slug }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {equipmentImageUrl(item.primary_image_url) ? (
          <img
            src={equipmentImageUrl(item.primary_image_url) ?? undefined}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
            statusStyles[item.status] ?? statusStyles["unavailable"],
          )}
        >
          {item.status === "available"
            ? `${item.available_units} available`
            : item.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="w-fit text-[11px] uppercase tracking-wider"
          >
            {categoryLabel(item.category)}
          </Badge>
          {item.for_rent && (
            <Badge variant="default" className="text-[11px] uppercase tracking-wider bg-field text-field-foreground">
              For Rent
            </Badge>
          )}
          {item.for_sale && (
            <Badge variant="default" className="text-[11px] uppercase tracking-wider bg-signal text-signal-foreground">
              For Sale
            </Badge>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-field" />
          {item.location}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-3">
              {item.for_rent && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {item.quote_only ? "Rental" : "Daily rate"}
                  </p>
                  <p className="text-lg font-bold text-brand">
                    {item.quote_only ? "Request quote" : formatDualCurrency(item.daily_rate, item.daily_rate_usd)}
                  </p>
                </div>
              )}
              {item.for_sale && item.sale_price && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Sale price
                  </p>
                  <p className="text-lg font-bold text-signal">
                    {formatDualCurrency(item.sale_price, item.sale_price_usd)}
                  </p>
                </div>
              )}
            </div>
            {!item.for_rent && !item.for_sale && (
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-brand transition-colors group-hover:bg-signal group-hover:text-signal-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
