import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock3,
  Facebook,
  Handshake,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site, whatsappLink } from "@/lib/site";
import { fetchSiteSettings } from "@/lib/db";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImage from "@/assests/header-banner.webp";

const heroBadges = [
  [ShieldCheck, "Trusted Partner"],
  [Clock3, "Fast Response"],
  [Settings, "Quality Equipment"],
  [Handshake, "Nationwide Support"],
] as const;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact & Enquiries | ${site.name}` },
      {
        name: "description",
        content: `Request a heavy equipment rental quote from ${site.name} in Yenagoa, Bayelsa State.`,
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const scope = useScrollReveal<HTMLDivElement>();
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });
  const phone = settings?.phone ?? site.phone;
  const phoneDisplay = settings?.phone ?? site.phoneDisplay;
  const email = settings?.email ?? site.email;
  const address = settings?.address ?? site.address;
  return (
    <SiteLayout hideCta>
      <div ref={scope}>
      <section className="relative overflow-hidden bg-hero-gradient pt-14 pb-16 sm:pt-16">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-sky-900/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div data-reveal className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Contact the team
            </p>
          </div>
          <h1
            data-reveal
            data-reveal-delay={0.06}
            className="mt-3 max-w-2xl text-4xl text-primary-foreground sm:text-6xl"
          >
            Tell us what you need{" "}
            <span className="text-sky-400">— we'll take it from there.</span>
          </h1>
          <p
            data-reveal
            data-reveal-delay={0.12}
            className="mt-5 max-w-2xl text-lg text-primary-foreground/80"
          >
            Equipment rental or purchase, energy &amp; petroleum, trading,
            logistics, construction or consultancy — send your enquiry and
            we'll respond with options, rates and next steps.
          </p>
          <div
            data-reveal
            data-reveal-delay={0.18}
            className="mt-8 flex flex-wrap gap-x-8 gap-y-4"
          >
            {heroBadges.map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-400/40 text-sky-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-primary-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card data-reveal className="shadow-lift">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
              Enquiry
            </p>
            <CardTitle className="mt-2 text-3xl">
              Tell us about the job
            </CardTitle>
            <p className="text-muted-foreground">
              Pick what you need below — the form adjusts to ask only what's
              relevant.
            </p>
          </CardHeader>
          <CardContent>
            <EnquiryForm />
          </CardContent>
        </Card>

        <aside data-reveal data-reveal-delay={0.1} className="space-y-5">
          <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white">
            <CardHeader>
              <CardTitle>Reach us directly</CardTitle>
              <p className="text-sm text-muted-foreground">
                We&apos;re here to help. Get in touch with our team.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <a
                href={`tel:${phone}`}
                className="flex items-start gap-3 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                  <Phone className="h-4 w-4" />
                </span>
                <span>
                  <strong className="block group-hover:text-sky-600">
                    {phoneDisplay}
                  </strong>
                  <small className="text-muted-foreground">
                    Call or WhatsApp
                  </small>
                </span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-start gap-3 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <strong className="block break-all group-hover:text-sky-600">
                    {email}
                  </strong>
                  <small className="text-muted-foreground">
                    Email enquiries
                  </small>
                </span>
              </a>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <strong className="block">Yenagoa base yard</strong>
                  <small className="text-muted-foreground">{address}</small>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                  <Clock3 className="h-4 w-4" />
                </span>
                <span>
                  <strong className="block">Operations desk</strong>
                  <small className="text-muted-foreground">
                    Monday–Saturday · 8:00am–6:00pm
                    <br />
                    Emergency site support available
                  </small>
                </span>
              </div>

              <div className="rounded-xl bg-sky-100/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-foreground">
                        Message us on WhatsApp
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get quick answers to your enquiry
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-sky-500 text-white hover:bg-sky-600"
                  >
                    <a
                      href={whatsappLink(
                        `Hello ${site.name}, I would like a rental quote.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Chat Now <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Follow the company</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild variant="outline">
                <a href={site.facebook} target="_blank" rel="noreferrer">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={site.instagram} target="_blank" rel="noreferrer">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
      </div>
    </SiteLayout>
  );
}
