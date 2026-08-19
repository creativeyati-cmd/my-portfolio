"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const NAV_SELECTION_KEY = "portfolio-nav-selection";

function buildMonogram(value) {
  const parts = String(value || "IO")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "IO";
  return parts.map((item) => item[0]).join("").toUpperCase();
}

function routeMatches(currentPath, href) {
  return href === "/"
    ? currentPath === "/"
    : currentPath === href || currentPath.startsWith(`${href}/`);
}

function navItemClass({ current, selected }) {
  return [
    "nav-link-chip",
    current ? "nav-link-chip-current" : "",
    selected ? "nav-link-chip-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function contactHref(settings) {
  if (settings?.contactEmail) return `mailto:${settings.contactEmail}`;
  if (settings?.contactPhone) return `tel:${settings.contactPhone}`;
  return "/contact";
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

export default function GlassNav({ currentPath = "/", labels, className = "" }) {
  const [selectedHref, setSelectedHref] = useState(() => {
    if (typeof window === "undefined") return "";

    try {
      return window.sessionStorage.getItem(NAV_SELECTION_KEY) || "";
    } catch {
      return "";
    }
  });
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

  function selectLink(href) {
    setSelectedHref(href);
    setMenuOpen(false);
    setContactOpen(false);

    try {
      window.sessionStorage.setItem(NAV_SELECTION_KEY, href);
    } catch {}
  }

  function openContact() {
    setSelectedHref("/contact");
    setContactOpen(true);
    setMenuOpen(false);

    try {
      window.sessionStorage.setItem(NAV_SELECTION_KEY, "/contact");
    } catch {}
  }

  return (
    <>
      <nav
        className={`glass-nav fixed left-1/2 top-4 z-40 flex w-[calc(100%-1.5rem)] max-w-[min(46rem,calc(100%-1.5rem))] -translate-x-1/2 items-center justify-between gap-2 px-2 py-2 sm:top-6 sm:px-3 ${className}`.trim()}
        aria-label="Primary"
      >
        <Link
          href="/"
          aria-label={labels?.siteTitle || "Portfolio"}
          className="flex h-11 min-w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 px-3 text-[#171512]/78 transition hover:bg-white"
          onClick={() => selectLink("/")}
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

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const current = routeMatches(currentPath, link.href);
            const selected = selectedHref === link.href && current;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={navItemClass({ current, selected })}
                onClick={() => selectLink(link.href)}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            className="nav-link-chip nav-link-chip-selected"
            onClick={openContact}
          >
            {labels?.navContactCtaLabel || labels?.navContactLabel || "Contact"}
          </button>
        </div>

        <button
          type="button"
          className="nav-link-chip md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
        >
          Menu
        </button>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-nav-panel"
          className="glass-nav fixed left-1/2 top-[5.4rem] z-40 w-[calc(100%-1.5rem)] max-w-[26rem] -translate-x-1/2 rounded-[1.75rem] p-3 md:hidden"
        >
          <div className="space-y-1">
            {links.map((link) => {
              const current = routeMatches(currentPath, link.href);
              const selected = selectedHref === link.href && current;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navItemClass({ current, selected })} w-full justify-start`}
                  onClick={() => selectLink(link.href)}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              className={`${navItemClass({
                current: routeMatches(currentPath, "/contact"),
                selected: selectedHref === "/contact" && contactOpen,
              })} w-full justify-start`}
              onClick={() => {
                setMenuOpen(false);
                openContact();
              }}
            >
              {labels?.navContactLabel || labels?.navContactCtaLabel || "Contact"}
            </button>
          </div>
        </div>
      ) : null}

      {contactOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(18,17,15,0.16)] px-4 py-24 backdrop-blur-sm">
          <div className="w-full max-w-[32rem] rounded-[1.75rem] border border-black/8 bg-[#f8f5ef] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-black/38">
                  {labels?.contactHeading || "Contact"}
                </p>
                <h2 className="mt-3 font-['PP_Neue_Montreal'] text-[2.45rem] leading-[0.95] tracking-[-0.06em] text-[#171512]">
                  {labels?.contactPageTitle || "Let&apos;s talk."}
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

            <p className="mt-4 max-w-[30rem] font-['Satoshi'] text-base leading-8 text-[#171512]/62">
              {labels?.contactPageLead ||
                "Reach out for commercial projects, launches, and story-led creative collaborations."}
            </p>

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

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={contactHref(labels)} className="nav-link-chip nav-link-chip-selected">
                {labels?.navContactCtaLabel || "Get in touch"}
              </a>
              <Link href="/contact" className="nav-link-chip" onClick={() => setContactOpen(false)}>
                Open contact page
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
