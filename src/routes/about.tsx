import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Compass,
  HardHat,
  Quote,
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
import { site } from "@/lib/site";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ceoPhoto from "@/assests/ceo-keme-inokoba.webp";
import headerBanner from "@/assests/header-banner.webp";

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

const heroBadges = [
  [ShieldCheck, "Reliable", "Equipment"],
  [Users, "Skilled", "Support Team"],
  [Clock, "On-Time", "Delivery"],
] as const;

function AboutPage() {
  const scope = useScrollReveal<HTMLDivElement>();
  return (
    <SiteLayout>
      <div ref={scope}>
      <section className="relative overflow-hidden bg-hero-gradient pt-14 pb-20 sm:pt-16">
        <img
          src={headerBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/70" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div data-reveal className="flex items-center gap-3">
              <span className="h-px w-8 bg-sky-400" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                About {site.shortName}
              </p>
            </div>
            <h1
              data-reveal
              data-reveal-delay={0.06}
              className="mt-4 max-w-xl text-4xl leading-tight text-primary-foreground sm:text-6xl"
            >
              Plant you can plan{" "}
              <span className="text-sky-400">around.</span>
            </h1>
            <p
              data-reveal
              data-reveal-delay={0.12}
              className="mt-6 max-w-xl text-lg text-primary-foreground/80"
            >
              {site.name} is a Yenagoa-based heavy equipment rental company
              supporting the contractors, developers and project teams building
              the Niger Delta.
            </p>
            <div
              data-reveal
              data-reveal-delay={0.18}
              className="mt-8 flex flex-wrap gap-6"
            >
              {heroBadges.map(([Icon, line1, line2]) => (
                <div key={line2} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-bold leading-tight text-primary-foreground">
                    {line1}
                    <br />
                    {line2}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div
            data-reveal
            data-reveal-delay={0.1}
            className="rounded-[2rem] border border-primary-foreground/15 bg-primary-foreground/5 p-8 backdrop-blur-sm sm:p-10"
          >
            <Quote className="h-8 w-8 text-sky-400" />
            <p className="mt-4 text-lg italic leading-relaxed text-primary-foreground/85">
              Great results are not accidents. They are built through
              discipline, consistency and a clear vision. Keep working, keep
              growing, and let your effort create the future you want.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <img
                src={ceoPhoto}
                alt="Keme Inokoba, CEO of Trans Weri Gulf Limited"
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-sky-400/40"
              />
              <div>
                <p className="font-bold text-primary-foreground">
                  Keme Inokoba
                </p>
                <p className="text-xs uppercase tracking-widest text-sky-300">
                  CEO, {site.name}
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-primary-foreground/15 pt-4 text-xs font-semibold uppercase tracking-widest text-sky-300">
              Safer projects{" "}
              <span className="text-primary-foreground/30">|</span> Stronger
              communities <span className="text-primary-foreground/30">|</span>{" "}
              A sustainable Niger Delta
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div
            data-reveal
            className="bg-brand-deep p-8 rounded-2xl text-primary-foreground"
          >
            <Target className="h-8 w-8 text-field mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg text-primary-foreground/80">
              To be the leading provider of integrated equipment rental, logistics, and management consultancy services across Nigeria and the West African region.
            </p>
          </div>
          <div
            data-reveal
            data-reveal-delay={0.08}
            className="bg-brand-deep p-8 rounded-2xl text-primary-foreground"
          >
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
        <Link
          to="/services"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-signal"
        >
          View all services <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div data-reveal className="relative overflow-hidden rounded-2xl">
            <img
              src={headerBanner}
              alt="Tracked bulldozer ready for earthworks"
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute left-5 top-5 rounded-md bg-signal px-3 py-2 text-xs font-bold uppercase tracking-widest text-signal-foreground">
              Niger Delta operations
            </div>
          </div>
          <div data-reveal data-reveal-delay={0.1}>
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
      </div>
    </SiteLayout>
  );
}
