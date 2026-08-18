import Link from "next/link";

import GlassNav from "@/components/GlassNav";
import { getSiteSettings, listCategories } from "@/lib/db";
import { buildRoleLines } from "@/lib/editorial";

export const dynamic = "force-dynamic";

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/42 sm:text-[11px]">
      {label}
    </p>
  );
}

function PulseStat({ value, label }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="font-['PP_Neue_Montreal'] text-[3.2rem] leading-none tracking-[-0.08em] text-[#12110f] sm:text-[4.5rem]">
        {value}
      </p>
      <p className="mt-2 font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42">
        {label}
      </p>
    </div>
  );
}

export default async function AboutPage() {
  const [settings, serviceCategories] = await Promise.all([
    getSiteSettings(),
    listCategories({ includeServices: true }),
  ]);
  const skills = splitLines(settings.skillsList);
  const openTo = splitLines(settings.openToList);
  const roleLines = buildRoleLines(settings.aboutBody || settings.introSubheading || "");
  const services = serviceCategories.flatMap((category) => category.services || []);
  const activeCategories = serviceCategories.filter((category) => category.status === "active");

  return (
    <main className="min-h-screen bg-[#f7f4ee] py-24 text-[#141311]">
      <GlassNav
        currentPath="/about"
        labels={settings}
        serviceCategories={activeCategories}
      />

      <div className="editorial-shell editorial-hero">
        <section className="grid gap-12 xl:grid-cols-[minmax(0,0.92fr)_minmax(260px,0.4fr)] xl:items-start">
          <div>
            {eyebrow(settings.aboutTitle)}
            <h1 className="mt-5 editorial-brand-name">{settings.aboutPageTitle}</h1>
            <div className="mt-[clamp(2.5rem,4vw,3.5rem)] editorial-role-title">
              {roleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
            <p className="mt-10 editorial-support-copy max-w-[28rem]">
              {settings.aboutPageLead}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {settings.location ? (
                <div className="rounded-full border border-black/10 px-4 py-2 font-['Satoshi'] text-sm text-black/70">
                  {settings.locationLabel}: {settings.location}
                </div>
              ) : null}
              {settings.profileAvailability ? (
                <div className="rounded-full border border-black/10 px-4 py-2 font-['Satoshi'] text-sm text-black/70">
                  {settings.availabilityLabel}: {settings.profileAvailability}
                </div>
              ) : null}
            </div>
          </div>

          <div className="self-start pt-2 xl:pt-3">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {eyebrow("Profile pulse")}
            <div className="mt-6 space-y-6">
              <PulseStat value={String(activeCategories.length).padStart(2, "0")} label="Categories" />
              <PulseStat value={String(services.length).padStart(2, "0")} label="Services" />
              <PulseStat value={String(skills.length).padStart(2, "0")} label="Practice areas" />
              <PulseStat value={String(openTo.length).padStart(2, "0")} label="Open collaborations" />
            </div>
          </div>
        </section>

        <section className="mt-18 grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.6fr)]">
          <div className="border-t border-black/10 pt-5">
            {eyebrow(settings.aboutNotesTitle)}
            <p className="mt-6 max-w-[46rem] font-['Satoshi'] text-base leading-9 text-black/64 sm:text-[18px]">
              {settings.aboutNotesBody}
            </p>
          </div>

          <aside className="border-t border-black/10 pt-5">
            {eyebrow(settings.contactHeading)}
            <div className="mt-6 space-y-3 font-['Satoshi'] text-sm leading-7 text-black/66">
              <p>{settings.contactEmail}</p>
              {settings.contactPhone ? <p>{settings.contactPhone}</p> : null}
              {settings.location ? <p>{settings.location}</p> : null}
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center border-b border-black/55 pb-1 font-['Satoshi'] text-sm uppercase tracking-[0.18em] text-black/82"
              >
                Continue to contact
              </Link>
            </div>
          </aside>
        </section>
      </div>

      <section className="relative left-1/2 mt-24 w-screen -translate-x-1/2 overflow-hidden bg-[#131210] py-18 text-[#f6f2ea]">
        <div className="editorial-shell">
          {eyebrow("Intermission")}
          <div className="mt-5 overflow-hidden">
            <div className="editorial-marquee whitespace-nowrap font-['PP_Neue_Montreal'] text-[3.1rem] leading-none tracking-[-0.09em] sm:text-[4.8rem] lg:text-[6.6rem]">
              Story first. Story first. Story first. Story first.
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-shell">
        <section className="mt-16 sm:mt-20" id="services">
          {eyebrow(settings.servicesTitle)}
          <div className="mt-6 space-y-12">
            {activeCategories.map((category, categoryIndex) => (
              <section key={category.id} id={`category-${category.slug}`} className="border-t border-black/10 pt-8">
                <div className="grid gap-6 xl:grid-cols-[120px_minmax(0,0.7fr)_minmax(280px,0.45fr)]">
                  <div className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                    {String(categoryIndex + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h2 className="font-['PP_Neue_Montreal'] text-[2.6rem] leading-[0.92] tracking-[-0.085em] text-[#12110f] sm:text-[3.9rem]">
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-4 max-w-[38rem] font-['Satoshi'] text-sm leading-7 text-black/62 sm:text-[15px] sm:leading-8">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-4 border-t border-black/8 pt-4 xl:border-t-0 xl:pt-0">
                    <div>
                      <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42">
                        Category pulse
                      </p>
                      <p className="mt-2 font-['Satoshi'] text-sm leading-7 text-black/62">
                        {category.services.length} services available
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.services.map((service) => (
                        <Link
                          key={service.id}
                          href={`#service-${service.slug}`}
                          className="rounded-full border border-black/10 px-3 py-2 font-['Satoshi'] text-xs text-black/72"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-0">
                  {category.services.map((service, serviceIndex) => (
                    <article
                      key={service.id}
                      id={`service-${service.slug}`}
                      className="grid gap-6 border-t border-black/8 py-8 md:grid-cols-[90px_minmax(0,0.8fr)_minmax(260px,0.5fr)]"
                    >
                      <div className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                        {String(serviceIndex + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="font-['PP_Neue_Montreal'] text-[2.2rem] leading-[0.94] tracking-[-0.085em] text-[#12110f] sm:text-[3rem]">
                          {service.name}
                        </h3>
                        <p className="mt-4 max-w-[34rem] font-['Satoshi'] text-sm leading-7 text-black/62 sm:text-[15px] sm:leading-8">
                          {service.description}
                        </p>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42">
                            {settings.serviceIdealForLabel}
                          </p>
                          <p className="mt-2 font-['Satoshi'] text-sm leading-7 text-black/62">
                            {service.idealFor}
                          </p>
                        </div>
                        <div>
                          <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42">
                            {settings.serviceDeliverablesLabel}
                          </p>
                          <p className="mt-2 font-['Satoshi'] text-sm leading-7 text-black/62">
                            {service.deliverables}
                          </p>
                        </div>
                        {service.cta ? (
                          <p className="font-['Satoshi'] text-[11px] uppercase tracking-[0.22em] text-black/78">
                            {service.cta}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-10 border-t border-black/10 pt-8 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
          <div>
            {eyebrow(settings.skillsTitle)}
            <div className="mt-6 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-black/10 px-4 py-2 font-['Satoshi'] text-sm text-black/72"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            {eyebrow(settings.openToTitle)}
            <div className="mt-6 space-y-3">
              {openTo.map((item, index) => (
                <div
                  key={item}
                  className="flex items-baseline justify-between gap-4 border-b border-black/6 pb-3"
                >
                  <span className="font-['Geist'] text-[10px] uppercase tracking-[0.22em] text-black/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-['Satoshi'] text-sm text-black/72">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
