import type { ReactNode } from "react";
import { BarChart3, ShieldCheck, Truck } from "lucide-react";
import heroBackground from "@/assests/background.png";
import { site } from "@/lib/site";

const authFeatures = [
  {
    icon: Truck,
    title: "Fleet visibility",
    body: "See your assets, locations and status in real time.",
  },
  {
    icon: BarChart3,
    title: "Live availability",
    body: "Make faster, smarter decisions with up-to-date fleet data.",
  },
  {
    icon: ShieldCheck,
    title: "Secure access",
    body: "Your data and operations are always protected.",
  },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-deep">
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Heavy equipment on a construction site at dusk"
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/50 lg:to-brand-deep/10" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden max-w-xl text-primary-foreground lg:block">
          <img
            src={site.logo}
            alt={site.name}
            className="h-12 w-fit rounded bg-background p-1"
          />
          <span className="mt-5 inline-flex items-center rounded-full border border-field/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-field">
            Fleet operations portal
          </span>
          <span className="mt-6 block h-0.5 w-10 bg-signal" />
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05]">
            Keep every{" "}
            <span className="text-field">
              machine moving<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="mt-5 max-w-md text-primary-foreground/75">
            Reliable fleet operations power stronger projects. Sign in to
            access your fleet, people and performance in one secure place.
          </p>
          <div className="mt-10 space-y-6">
            {authFeatures.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-field">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold">{f.title}</p>
                  <p className="mt-0.5 text-sm text-primary-foreground/70">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
