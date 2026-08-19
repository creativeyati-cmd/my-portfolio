import Link from "next/link";

import GlassNav from "@/components/GlassNav";
import { getSiteSettings, listCategories } from "@/lib/db";
import { buildRoleLines, splitList } from "@/lib/editorial";

export const dynamic = "force-dynamic";

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 sm:text-[11px]">
      {label}
    </p>
  );
}

function PulseStat({ value, label }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="font-['PP_Neue_Montreal'] text-[3.15rem] leading-none tracking-[-0.08em] text-[#171512] sm:text-[4.3rem]">
        {value}
      </p>
      <p className="mt-2 font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
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
  const skills = splitList(settings.skillsList);
  const openTo = splitList(settings.openToList);
  const roleLines = buildRoleLines(settings.aboutBody || settings.introSubheading || "");
  const activeCategories = serviceCategories.filter((category) => category.status === "active");
  const services = activeCategories.flatMap((category) => category.services || []);

  return (
    <main className="min-h-screen bg-[#f5f2ec] pb-20 pt-24 text-[#171512] sm:pb-24">
      <GlassNav currentPath="/about" labels={settings} />

      <div className="editorial-shell editorial-hero">
        <section className="editorial-grid items-start gap-y-12">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(settings.aboutTitle || "Profile")}
            <h1 className="mt-5 editorial-brand-name">{settings.aboutPageTitle}</h1>
            <div className="mt-8 editorial-role-title max-w-[12ch]">
              {roleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-[35rem] font-['Satoshi'] text-[1.05rem] leading-8 text-black/64 sm:text-[1.08rem]">
              {settings.aboutPageLead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {settings.profileAvailability ? (
                <span className="editorial-chip">
                  {settings.availabilityLabel}: {settings.profileAvailability}
                </span>
              ) : null}
              {settings.location ? (
                <span className="editorial-chip">
                  {settings.locationLabel}: {settings.location}
                </span>
              ) : null}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 xl:pl-8">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {eyebrow("Profile pulse")}
            <div className="mt-6 space-y-5">
              <PulseStat value={String(activeCategories.length).padStart(2, "0")} label="Service categories" />
              <PulseStat value={String(services.length).padStart(2, "0")} label="Capabilities" />
              <PulseStat value={String(skills.length).padStart(2, "0")} label="Skill tags" />
              <PulseStat value={String(openTo.length).padStart(2, "0")} label="Open to" />
            </div>
          </div>
        </section>

        <section className="mt-18 editorial-grid gap-y-10 border-t border-black/10 pt-8">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(settings.aboutNotesTitle || "Perspective")}
            <p className="mt-5 max-w-[44rem] font-['Satoshi'] text-[1.02rem] leading-9 text-black/66 sm:text-[1.12rem]">
              {settings.aboutNotesBody}
            </p>
          </div>
          <aside className="col-span-12 xl:col-span-5 xl:pl-8">
            {eyebrow(settings.contactHeading || "Contact")}
            <div className="mt-5 space-y-3 font-['Satoshi'] text-base leading-8 text-black/66">
              <p>{settings.contactEmail}</p>
              {settings.contactPhone ? <p>{settings.contactPhone}</p> : null}
              {settings.location ? <p>{settings.location}</p> : null}
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex border-b border-black/55 pb-1 font-['Satoshi'] text-[11px] uppercase tracking-[0.2em] text-black/78"
              >
                Continue to contact
              </Link>
            </div>
          </aside>
        </section>
      </div>

      <section className="relative left-1/2 mt-22 w-screen -translate-x-1/2 overflow-hidden bg-[#131210] py-16 text-[#f5f2ec] sm:py-18">
        <div className="editorial-shell">
          {eyebrow("Intermission")}
          <div className="mt-5 overflow-hidden">
            <div className="editorial-marquee whitespace-nowrap font-['PP_Neue_Montreal'] text-[2.8rem] leading-none tracking-[-0.08em] sm:text-[4.2rem] lg:text-[5.8rem]">
              {`Story-led creative direction. Story-led creative direction. Story-led creative direction.`}
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-shell">
        <section className="mt-16 sm:mt-20" id="services">
          {eyebrow(settings.servicesTitle || "Capabilities")}
          <div className="mt-6 space-y-14">
            {activeCategories.map((category, categoryIndex) => (
              <section key={category.id} className="border-t border-black/10 pt-8">
                <div className="editorial-grid gap-y-8">
                  <div className="col-span-12 xl:col-span-4">
                    <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                      {String(categoryIndex + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-4 font-['PP_Neue_Montreal'] text-[clamp(2.8rem,4.8vw,4.5rem)] leading-[0.95] tracking-[-0.06em] text-[#171512]">
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-4 max-w-[28rem] font-['Satoshi'] text-base leading-8 text-black/62">
                        {category.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-span-12 xl:col-span-8">
                    <div className="space-y-0">
                      {category.services.map((service, serviceIndex) => (
                        <details
                          key={service.id}
                          className="group border-t border-black/8 py-6 first:border-t-0"
                          id={`service-${service.slug}`}
                        >
                          <summary className="grid cursor-pointer list-none gap-4 md:grid-cols-[72px_minmax(0,1fr)_minmax(220px,0.72fr)]">
                            <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                              {String(serviceIndex + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h3 className="font-['PP_Neue_Montreal'] text-[2rem] leading-[0.95] tracking-[-0.06em] text-[#171512] sm:text-[2.55rem]">
                                {service.name}
                              </h3>
                              <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/62">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="font-['Satoshi'] text-sm uppercase tracking-[0.18em] text-black/46">
                                Expand
                              </span>
                              <span className="text-black/42 transition group-open:rotate-45">+</span>
                            </div>
                          </summary>

                          <div className="mt-5 grid gap-6 border-t border-black/8 pt-5 md:grid-cols-2">
                            <div>
                              <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                                {settings.serviceIdealForLabel}
                              </p>
                              <p className="mt-2 font-['Satoshi'] text-base leading-8 text-black/62">
                                {service.idealFor}
                              </p>
                            </div>
                            <div>
                              <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                                {settings.serviceDeliverablesLabel}
                              </p>
                              <p className="mt-2 font-['Satoshi'] text-base leading-8 text-black/62">
                                {service.deliverables}
                              </p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-16 editorial-grid gap-y-10 border-t border-black/10 pt-8 sm:mt-20">
          <div className="col-span-12 xl:col-span-6">
            {eyebrow(settings.skillsTitle)}
            <div className="mt-5 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill} className="editorial-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-6 xl:pl-8">
            {eyebrow(settings.openToTitle)}
            <div className="mt-5 space-y-3">
              {openTo.map((item, index) => (
                <div
                  key={item}
                  className="flex items-baseline gap-4 border-b border-black/6 pb-3"
                >
                  <span className="font-['Geist'] text-[10px] uppercase tracking-[0.22em] text-black/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-['Satoshi'] text-base leading-8 text-black/68">
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
