import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { getAdminAccount, getSiteSettings } from "@/lib/db";

import {
  AccountForm,
  CheckboxField,
  Field,
  PageHeader,
  SettingsForm,
  Textarea,
  ToastBanner,
} from "../../_components";
import SettingsNav, { getSettingsItems } from "../../settings-nav";

export const dynamic = "force-dynamic";

function SettingsSectionLayout({ current, title, children }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <SettingsNav current={current} />
      <section className="admin-panel bg-white p-5 sm:p-6">
        <h2 className="admin-section-title mb-5">{title}</h2>
        {children}
      </section>
    </div>
  );
}

function GeneralSection({ settings }) {
  return (
    <SettingsForm
      redirectTo="/admin/settings/general"
      savedState="settings-updated"
      submitLabel="Save changes"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Portfolio name" name="siteTitle" defaultValue={settings.siteTitle} />
        <Field label="Portfolio URL" name="portfolioUrl" defaultValue={settings.portfolioUrl} />
        <Field label="Tagline" name="aboutPageLead" defaultValue={settings.aboutPageLead} />
        <Field
          label="Default language"
          name="defaultLanguage"
          defaultValue={settings.defaultLanguage}
        />
        <Field label="Timezone" name="timezone" defaultValue={settings.timezone} />
      </div>
    </SettingsForm>
  );
}

function ContentSection({ settings }) {
  return (
    <SettingsForm
      redirectTo="/admin/settings/content"
      savedState="content-updated"
      submitLabel="Save changes"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Hero headline" name="introHeading" defaultValue={settings.introHeading} />
          <Field label="Hero CTA" name="ctaLabel" defaultValue={settings.ctaLabel} />
          <Textarea
            label="Hero introduction"
            name="introSubheading"
            defaultValue={settings.introSubheading}
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="About title" name="aboutPageTitle" defaultValue={settings.aboutPageTitle} />
          <Textarea label="Biography" name="aboutNotesBody" defaultValue={settings.aboutNotesBody} rows={5} />
          <Field label="Profile title" name="aboutBody" defaultValue={settings.aboutBody} />
          <Textarea label="Introduction" name="aboutPageLead" defaultValue={settings.aboutPageLead} rows={3} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Services title" name="servicesTitle" defaultValue={settings.servicesTitle} />
          <Field label="Skills title" name="skillsTitle" defaultValue={settings.skillsTitle} />
          <Textarea label="Skills list" name="skillsList" defaultValue={settings.skillsList} rows={6} />
          <Textarea label="Open to list" name="openToList" defaultValue={settings.openToList} rows={6} />
        </div>
      </div>
    </SettingsForm>
  );
}

function ContactSection({ settings }) {
  return (
    <SettingsForm
      redirectTo="/admin/settings/contact"
      savedState="contact-updated"
      submitLabel="Save changes"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Public email" name="contactEmail" defaultValue={settings.contactEmail} />
        <Field label="Phone" name="contactPhone" defaultValue={settings.contactPhone} />
        <Field label="Location" name="location" defaultValue={settings.location} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp} />
        <Field label="LinkedIn" name="linkedinUrl" defaultValue={settings.linkedinUrl} />
        <Field label="Instagram" name="instagramUrl" defaultValue={settings.instagramUrl} />
        <Field label="YouTube" name="youtubeUrl" defaultValue={settings.youtubeUrl} />
      </div>
    </SettingsForm>
  );
}

function BookingSection({ settings }) {
  return (
    <SettingsForm
      redirectTo="/admin/settings/booking"
      savedState="settings-updated"
      submitLabel="Save changes"
    >
      <div className="space-y-4">
        <CheckboxField
          label="Enable booking"
          name="bookingEnabled"
          defaultChecked={settings.bookingEnabled}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Booking CTA" name="bookingCta" defaultValue={settings.bookingCta} />
          <Field label="Booking URL" name="bookingUrl" defaultValue={settings.bookingUrl} />
        </div>
      </div>
    </SettingsForm>
  );
}

function SeoSection({ settings }) {
  return (
    <SettingsForm
      redirectTo="/admin/settings/seo"
      savedState="settings-updated"
      submitLabel="Save changes"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Site title" name="seoTitle" defaultValue={settings.seoTitle} />
        <Field label="Tracking ID" name="trackingId" defaultValue={settings.trackingId} />
        <Textarea
          label="Meta description"
          name="metaDescription"
          defaultValue={settings.metaDescription}
          rows={4}
        />
      </div>
    </SettingsForm>
  );
}

function AccountSection({ account }) {
  return <AccountForm account={account} redirectTo="/admin/settings/account" />;
}

function UnsupportedSection({ title }) {
  return (
    <div className="space-y-2 text-sm text-black/58">
      <p>{title} is not connected in this build yet.</p>
      <p>The route exists so the admin structure can grow without breaking navigation.</p>
    </div>
  );
}

export default async function AdminSettingsSectionPage({ params, searchParams }) {
  const [{ section }, query] = await Promise.all([params, searchParams]);
  const settings = getSiteSettings();
  const session = await requireAdmin();
  const account = getAdminAccount(session.username);

  const allowed = new Set([
    ...getSettingsItems().map((item) => item.key),
    "notifications",
  ]);

  if (!allowed.has(section)) {
    notFound();
  }

  const content = {
    general: <GeneralSection settings={settings} />,
    content: <ContentSection settings={settings} />,
    contact: <ContactSection settings={settings} />,
    booking: <BookingSection settings={settings} />,
    seo: <SeoSection settings={settings} />,
    account: <AccountSection account={account} />,
    notifications: <UnsupportedSection title="Notifications" />,
  };

  const title =
    getSettingsItems().find((item) => item.key === section)?.label ||
    "Notifications";

  return (
    <SettingsSectionLayout current={section} title={title}>
      <ToastBanner toast={query?.toast} error={query?.error} />
      <div className="mt-5">{content[section]}</div>
    </SettingsSectionLayout>
  );
}
