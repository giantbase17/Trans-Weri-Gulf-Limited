import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  HardHat,
  MapPin,
  ShieldCheck,
  Truck,
  Wrench,
  Target,
  Eye,
  Heart,
  Users,
  Zap,
  Package,
  Globe,
  Building,
  Briefcase,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { site, whatsappLink } from "@/lib/site";
import yardImage from "@/assests/eq-p38_1.jpg";
import workImage from "@/assests/eq-p6_1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us | ${site.name}` },
      {
        name: "description",
        content: `${site.name} supplies dependable heavy equipment rental from Yenagoa across Bayelsa State and the Niger Delta.`,
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: ShieldCheck,
    title: "Site-ready by default",
    body: "Equipment is checked, documented and prepared for demanding construction, marine and energy work.",
  },
  {
    icon: Wrench,
    title: "Maintenance that moves",
    body: "Planned servicing and responsive field support help protect your programme from avoidable downtime.",
  },
  {
    icon: HardHat,
    title: "People who understand site",
    body: "Operators, mechanics and mobilisation partners work with practical HSE discipline in difficult terrain.",
  },
];

const coreValues = [
  {
    icon: Heart,
    title: "Integrity",
    body: "We conduct our business with honesty, transparency, and ethical principles in all our dealings.",
  },
  {
    icon: BadgeCheck,
    title: "Professionalism",
    body: "We deliver high-quality services through skilled expertise and adherence to industry standards.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    body: "We consistently meet our commitments and deliver dependable solutions to our clients.",
  },
  {
    icon: Users,
    title: "Safety & Responsibility",
    body: "We prioritize the safety of our people, clients, and the environment in all operations.",
  },
  {
    icon: Building,
    title: "Partnership",
    body: "We build lasting relationships based on mutual trust, respect, and shared success.",
  },
  {
    icon: Zap,
    title: "Continuous Improvement",
    body: "We constantly innovate and enhance our processes to deliver better value and service.",
  },
];

const services = [
  {
    icon: Zap,
    title: "Energy & Petroleum",
    body: "Comprehensive solutions for oil and gas operations, including equipment supply and logistics support.",
  },
  {
    icon: Package,
    title: "General Trading",
    body: "Supply of quality materials and equipment across various industries with competitive pricing.",
  },
  {
    icon: Globe,
    title: "Import & Export",
    body: "International trade facilitation with expertise in customs clearance and global logistics.",
  },
  {
    icon: Truck,
    title: "Logistics",
    body: "End-to-end transportation and distribution services with fleet management capabilities.",
  },
  {
    icon: Building,
    title: "Construction",
    body: "Heavy construction equipment rental and civil works for infrastructure development projects.",
  },
  {
    icon: Briefcase,
    title: "Management Consultancy",
    body: "Strategic business advisory services for operational excellence and organizational growth.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero-gradient pt-14 pb-20 sm:pt-16 grain-overlay">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">
              About {site.shortName}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-primary-foreground sm:text-6xl">
              Plant you can plan around.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
              {site.name} is a Yenagoa-based heavy equipment rental company
              supporting the contractors, developers and project teams building
              the Niger Delta.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-2xl border border-primary-foreground/15 sm:h-96">
            <img
              src={yardImage}
              alt="Heavy excavator from the Trans Weri Gulf fleet"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              <MapPin className="h-4 w-4 text-field" /> {site.addressShort}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="bg-brand-deep p-8 rounded-2xl text-primary-foreground">
            <Target className="h-8 w-8 text-field mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg text-primary-foreground/80">
              To be the leading provider of integrated equipment rental, logistics, and management consultancy services across Nigeria and the West African region.
            </p>
          </div>
          <div className="bg-brand-deep p-8 rounded-2xl text-primary-foreground">
            <Eye className="h-8 w-8 text-field mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-primary-foreground/80">
              To deliver exceptional value to our clients through innovative solutions, reliable equipment, and professional services that exceed expectations while maintaining the highest standards of safety and quality.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              Our Foundation
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Core Values That Guide Us
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map(({ icon: Icon, title, body }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
                className="border-t-4 border-brand bg-card p-6 shadow-sm"
              >
                <Icon className="h-7 w-7 text-signal" />
                <h3 className="mt-6 text-xl">{title}</h3>
                <p className="mt-3 text-muted-foreground">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              What We Do
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Integrated capabilities across the commercial and project lifecycle
            </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, body }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08 }}
              className="border-l-4 border-field bg-card p-6 shadow-sm"
            >
              <Icon className="h-7 w-7 text-signal" />
              <h3 className="mt-6 text-xl">{title}</h3>
              <p className="mt-3 text-muted-foreground">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={workImage}
              alt="Tracked bulldozer ready for earthworks"
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute left-5 top-5 rounded-md bg-signal px-3 py-2 text-xs font-bold uppercase tracking-widest text-signal-foreground">
              Niger Delta operations
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              Built for the work
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Reliable equipment, clear communication, practical support.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              From one machine for a short civil works package to a coordinated
              fleet mobilisation, we make it easier to secure capable plant,
              understand the cost and keep your site moving.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(
                [
                  [
                    Compass,
                    "Local knowledge",
                    "Yenagoa base with reach across Bayelsa and the wider Niger Delta.",
                  ],
                  [
                    Truck,
                    "Mobilisation ready",
                    "Lowbed delivery, project scheduling and site coordination on request.",
                  ],
                  [
                    BadgeCheck,
                    "Transparent rental",
                    "Daily, weekly, monthly and project-based options with quote-only flexibility.",
                  ],
                  [
                    HardHat,
                    "HSE-minded",
                    "Operators and support teams prepared for controlled, professional site work.",
                  ],
                ] as const
              ).map(([Icon, title, body]) => (
                <div
                  key={String(title)}
                  className="border-l-2 border-field pl-4"
                >
                  <Icon className="h-5 w-5 text-field" />
                  <h3 className="mt-2 font-bold">{String(title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(body)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
              How we work
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              A dependable partner from quote to demobilisation.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
                className="border-t-4 border-brand bg-card p-6 shadow-sm"
              >
                <Icon className="h-7 w-7 text-signal" />
                <h3 className="mt-6 text-xl">{title}</h3>
                <p className="mt-3 text-muted-foreground">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-deep py-20 text-center text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">
            Let us scope it
          </p>
          <h2 className="mt-3 text-3xl sm:text-5xl">
            Tell us what your project needs.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/70">
            Share the machine, location and duration. We will come back with
            availability and a mobilisation plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="signal" size="xl">
              <Link to="/contact">
                Start an enquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <a
                href={whatsappLink(
                  `Hello ${site.name}, I would like to discuss a project requirement.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp the team
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
