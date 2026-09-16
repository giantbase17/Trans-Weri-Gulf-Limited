import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Mail, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import ctaImage from "@/assests/eq-p6_1.webp";

export function QuoteCta() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-0 h-full w-[45%] opacity-40"
        style={{
          clipPath: "polygon(0 0, 55% 0, 20% 100%, 0 100%)",
          background:
            "linear-gradient(135deg, oklch(0.75 0.14 220 / 0.5), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <img
          src={ctaImage}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/75 to-brand-deep/10" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Truck className="mx-auto h-10 w-10 text-sky-400" />
        <h2 className="mt-5 text-3xl text-primary-foreground sm:text-5xl">
          Need a machine <span className="text-sky-400">on site</span> this
          week?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
          Send us your scope and duration. We will respond with availability,
          rates and a mobilisation plan — usually within the hour.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="xl"
            className="rounded-full border-0 bg-gradient-to-r from-sky-500 to-sky-400 font-bold uppercase tracking-wide text-white shadow-lift hover:brightness-110"
          >
            <Link to="/contact">
              <FileText className="h-4 w-4" />
              Request a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="xl"
            className="rounded-full border-sky-400/40 bg-transparent font-bold uppercase tracking-wide text-primary-foreground hover:bg-sky-400/10"
          >
            <a href={`mailto:${site.email}`}>
              <Mail className="h-4 w-4" />
              Email Our Team
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
