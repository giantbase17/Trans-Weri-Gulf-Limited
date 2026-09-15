import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock3 } from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site, whatsappLink } from "@/lib/site";
import { fetchSiteSettings } from "@/lib/db";

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
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });
  const phone = settings?.phone ?? site.phone;
  const phoneDisplay = settings?.phone ?? site.phoneDisplay;
  const email = settings?.email ?? site.email;
  const address = settings?.address ?? site.address;
  return (
    <SiteLayout>
      <section className="bg-hero-gradient pt-14 pb-16 sm:pt-16 grain-overlay">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">
            Contact the team
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-primary-foreground sm:text-6xl">
            Let&apos;s put the right machine on site.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
            Send your project details and we will respond with equipment
            options, rates and a mobilisation plan.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-lift">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              Rental enquiry
            </p>
            <CardTitle className="mt-2 text-3xl">
              Tell us about the job
            </CardTitle>
            <p className="text-muted-foreground">
              The more detail you share, the faster we can prepare a useful
              quote.
            </p>
          </CardHeader>
          <CardContent>
            <EnquiryForm />
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Reach us directly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <a href={`tel:${phone}`} className="flex items-start gap-3 group">
                <Phone className="mt-0.5 h-5 w-5 text-signal" />
                <span>
                  <strong className="block group-hover:text-signal">
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
                <Mail className="mt-0.5 h-5 w-5 text-signal" />
                <span>
                  <strong className="block break-all group-hover:text-signal">
                    {email}
                  </strong>
                  <small className="text-muted-foreground">
                    Email enquiries
                  </small>
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-field" />
                <span>
                  <strong className="block">Yenagoa base yard</strong>
                  <small className="text-muted-foreground">{address}</small>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-field" />
                <span>
                  <strong className="block">Operations desk</strong>
                  <small className="text-muted-foreground">
                    Monday–Saturday · 8:00am–6:00pm
                    <br />
                    Emergency site support available
                  </small>
                </span>
              </div>
              <Button asChild variant="field" className="w-full">
                <a
                  href={whatsappLink(
                    `Hello ${site.name}, I would like a rental quote.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Message us on WhatsApp
                </a>
              </Button>
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
    </SiteLayout>
  );
}
