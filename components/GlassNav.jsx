"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function buildMonogram(value) {
  const parts = String(value || "IO")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "IO";
  return parts.map((item) => item[0]).join("").toUpperCase();
}

function navItemClass({ selected }) {
  return [
    "nav-link-chip",
    selected ? "nav-link-chip-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function preferredInquiryLabel(settings) {
  const raw = String(settings?.bookingCta || settings?.navContactCtaLabel || "").trim();
  if (!raw) return "Get in touch";

  const normalized = raw.toLowerCase();
  if (normalized === "contact" || normalized === "book a call") {
    return "Get in touch";
  }

  return raw;
}

function contactHref(settings) {
  if (settings?.contactEmail) return `mailto:${settings.contactEmail}`;
  if (settings?.contactPhone) return `tel:${settings.contactPhone}`;
  return "/contact";
}

function inquiryFormUrl(settings) {
  return String(settings?.bookingUrl || "").trim();
}

function inquiryFormEmbedUrl(settings) {
  const raw = inquiryFormUrl(settings);
  if (!raw) return "";
  if (/forms\.gle\//i.test(raw)) return "";

  try {
    const url = new URL(raw);

    if (!/docs\.google\.com$/i.test(url.hostname)) {
      return raw;
    }

    if (url.pathname.includes("/formResponse")) {
      url.pathname = url.pathname.replace("/formResponse", "/viewform");
    }

    if (url.pathname.includes("/viewform")) {
      url.searchParams.set("embedded", "true");
      return url.toString();
    }

    return raw;
  } catch {
    return "";
  }
}

function ContactLine({ label, value, href }) {
  if (!value) return null;

  const content = (
    <div className="border-t border-black/8 py-4 first:border-t-0 first:pt-0">
      <p className="text-[10px] uppercase tracking-[0.24em] text-black/38">{label}</p>
      <p className="mt-2 font-['Satoshi'] text-base leading-7 text-[#171512]/78">{value}</p>
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

export default function GlassNav({ labels, className = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const monogram = buildMonogram(labels?.siteTitle);
  const links = useMemo(
    () => [
      { href: "/projects", label: labels?.navProjectsLabel || "Projects" },
      { href: "/about", label: labels?.navAboutLabel || "About" },
    ],
    [labels],
  );
  const logoSrc = labels?.logoPath || labels?.siteLogo || labels?.brandLogoPath || "";
  const logoAlt = labels?.logoAlt || labels?.siteTitle || "Portfolio";
  const inquiryLabel = preferredInquiryLabel(labels);
  const inquiryUrl = inquiryFormUrl(labels);
  const inquiryEmbed = inquiryFormEmbedUrl(labels);
  const hasEmbeddedInquiry = Boolean(inquiryEmbed);

  function selectLink() {
    setMenuOpen(false);
    setContactOpen(false);
  }

  function openContact() {
    setContactOpen(true);
    setMenuOpen(false);
  }

  return (
    <>
      <div className={`fixed inset-x-0 top-4 z-40 px-3 sm:top-6 ${className}`.trim()}>
        <div className="relative mx-auto flex max-w-[72rem] items-center justify-center">
          <nav
            className="glass-nav flex w-fit max-w-[calc(100vw-1.5rem)] items-center justify-between gap-2 px-2 py-2 sm:px-3 lg:w-full lg:max-w-[46rem]"
            aria-label="Primary"
          >
            <Link
              href="/"
              aria-label={labels?.siteTitle || "Portfolio"}
              className="flex h-11 min-w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 px-3 text-[#171512]/78 transition hover:bg-white"
              onClick={() => selectLink()}
            >
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={logoAlt} className="h-6 w-auto object-contain" />
              ) : (
                <span className="font-['Geist'] text-[10px] uppercase tracking-[0.22em]">
                  {monogram}
                </span>
              )}
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {links.map((link) => {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navItemClass({ selected: false })}
                    onClick={() => selectLink()}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <span aria-hidden="true" className="hidden h-11 min-w-11 lg:block" />

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                className="nav-link-chip"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-panel"
              >
                Menu
              </button>
            </div>
          </nav>

          <button
            type="button"
            className="nav-link-chip nav-link-chip-selected absolute right-0 top-1/2 hidden h-11 -translate-y-1/2 px-5 lg:inline-flex"
            onClick={openContact}
          >
            {inquiryLabel}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav-panel"
          className="glass-sheet fixed left-1/2 top-[5.4rem] z-40 w-[min(18.5rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-[1.75rem] p-3 lg:hidden"
        >
          <div className="space-y-1">
            {links.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navItemClass({ selected: false })} w-full justify-start`}
                  onClick={() => selectLink()}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              className="nav-link-chip nav-link-chip-selected mt-2 w-full justify-center"
              onClick={() => {
                setMenuOpen(false);
                openContact();
              }}
            >
              {inquiryLabel}
            </button>
          </div>
        </div>
      ) : null}

      {contactOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(18,17,15,0.16)] px-4 py-20 backdrop-blur-sm sm:py-24">
          <div className="glass-sheet flex max-h-[calc(100vh-5rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-[1.75rem]">
            <div className="border-b border-white/35 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/38">
                    Project inquiry
                  </p>
                  <h2 className="mt-3 font-['PP_Neue_Montreal'] text-[2.45rem] leading-[0.95] tracking-[-0.06em] text-[#171512]">
                    Start the conversation.
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="nav-link-chip"
                >
                  Close
                </button>
              </div>

              <p className="mt-4 max-w-[34rem] font-['Satoshi'] text-base leading-8 text-[#171512]/62">
                Share the project essentials first. A short form keeps the process clear, quick, and easy to complete from any device.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {hasEmbeddedInquiry ? (
                <div className="glass-card overflow-hidden rounded-[1.25rem]">
                  <iframe
                    src={inquiryEmbed}
                    title="Project inquiry form"
                    className="h-[min(62vh,42rem)] w-full"
                  />
                </div>
              ) : inquiryUrl ? (
                <div className="glass-card rounded-[1.25rem] px-5 py-5">
                  <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                    Inquiry form
                  </p>
                  <p className="mt-3 font-['Satoshi'] text-base leading-8 text-[#171512]/64">
                    The Google Form opens in a new tab so the full inquiry can be completed without compressing the questions into a cramped modal.
                  </p>
                </div>
              ) : (
                <div className="glass-card rounded-[1.25rem] px-5 py-5">
                  <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                    Inquiry form not added yet
                  </p>
                  <p className="mt-3 font-['Satoshi'] text-base leading-8 text-[#171512]/64">
                    Add a Google Form URL in admin under Settings and Inquiries to turn this CTA into a full lead capture flow.
                  </p>
                </div>
              )}

              <div className="mt-8">
                <ContactLine
                  label={labels?.emailLabel || "Email"}
                  value={labels?.contactEmail}
                  href={labels?.contactEmail ? `mailto:${labels.contactEmail}` : ""}
                />
                <ContactLine
                  label={labels?.phoneLabel || "Phone"}
                  value={labels?.contactPhone}
                  href={labels?.contactPhone ? `tel:${labels.contactPhone}` : ""}
                />
                <ContactLine
                  label={labels?.locationLabel || "Location"}
                  value={labels?.location}
                />
              </div>
            </div>

            <div className="border-t border-white/35 p-6">
              <div className="flex flex-wrap gap-3">
                {inquiryUrl ? (
                  <a
                    href={inquiryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="nav-link-chip nav-link-chip-selected"
                  >
                    Open full form
                  </a>
                ) : null}
                <a href={contactHref(labels)} className="nav-link-chip">
                  {labels?.contactEmail ? "Email directly" : "Open contact details"}
                </a>
                <Link href="/contact" className="nav-link-chip" onClick={() => setContactOpen(false)}>
                  Contact page
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
