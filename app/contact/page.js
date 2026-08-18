import GlassNav from "@/components/GlassNav";
import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

function ContactLink({ href, label, value }) {
  if (!value) return null;

  const content = (
    <div className="border-t border-black/8 p-5 transition">
      <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
        {label}
      </p>
      <p className="mt-4 font-['Satoshi'] text-lg text-black/74">{value}</p>
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

export default async function ContactPage() {
  const settings = getSiteSettings();

  return (
    <main className="min-h-screen bg-[#f7f4ee] py-24 text-[#111]">
      <GlassNav currentPath="/contact" labels={settings} />

      <div className="editorial-shell editorial-hero">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.58fr)]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
              {settings.contactHeading}
            </p>
            <h1 className="mt-5 editorial-page-title max-w-[10ch]">
              {settings.contactPageTitle}
            </h1>
            <p className="mt-10 editorial-support-copy max-w-[33rem]">
              {settings.contactPageLead}
            </p>
          </div>

          <div className="lg:pt-3">
            <div className="mb-6 flex justify-start lg:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            <div className="grid gap-4">
              {settings.profileAvailability ? (
                <ContactLink
                  label={settings.availabilityLabel}
                  value={settings.profileAvailability}
                />
              ) : null}
              <ContactLink
                label={settings.emailLabel}
                value={settings.contactEmail}
                href={`mailto:${settings.contactEmail}`}
              />
              <ContactLink
                label={settings.phoneLabel}
                value={settings.contactPhone}
                href={settings.contactPhone ? `tel:${settings.contactPhone}` : ""}
              />
              <ContactLink
                label={settings.whatsappLabel}
                value={settings.whatsapp}
                href={settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : ""}
              />
              <ContactLink label={settings.locationLabel} value={settings.location} />

              {(settings.instagramUrl ||
                settings.linkedinUrl ||
                settings.youtubeUrl) ? (
                <div className="border-t border-black/8 p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
                    {settings.socialsLabel}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 font-['Satoshi'] text-sm text-black/72">
                    {settings.instagramUrl ? (
                      <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
                        Instagram
                      </a>
                    ) : null}
                    {settings.linkedinUrl ? (
                      <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    ) : null}
                    {settings.youtubeUrl ? (
                      <a href={settings.youtubeUrl} target="_blank" rel="noreferrer">
                        YouTube
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
