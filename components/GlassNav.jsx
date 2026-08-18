import Link from "next/link";

function itemClass(active) {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition sm:px-4 sm:text-[11px]",
    active
      ? "bg-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
      : "text-black/58 hover:bg-white/55 hover:text-black",
  ].join(" ");
}

function buildMonogram(value) {
  const parts = String(value || "IO")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "IO";
  return parts.map((item) => item[0]).join("").toUpperCase();
}

export default function GlassNav({
  currentPath = "/",
  className = "",
  labels,
  serviceCategories = [],
}) {
  const links = [
    { href: "/", label: labels?.navHomeLabel || "Home" },
    { href: "/projects", label: labels?.navProjectsLabel || "Projects" },
    { href: "/about", label: labels?.navAboutLabel || "About" },
  ];

  const servicesLabel = labels?.navServicesLabel || "Services";
  const contactCtaLabel = labels?.navContactCtaLabel || labels?.navContactLabel || "Contact";
  const monogram = buildMonogram(labels?.siteTitle);

  return (
    <nav
      className={`glass-nav fixed left-1/2 top-4 z-30 flex w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 items-center justify-center gap-1 p-1.5 sm:top-[3.2vh] sm:w-auto ${className}`.trim()}
      aria-label="Primary"
    >
      <Link
        href="/"
        aria-label={labels?.siteTitle || "Portfolio"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 font-['Geist'] text-[10px] uppercase tracking-[0.22em] text-black/72"
      >
        {monogram}
      </Link>

      <div className="relative group/services">
        <Link
          href="/about#services"
          className={itemClass(currentPath === "/about")}
        >
          {servicesLabel}
        </Link>
        {serviceCategories.length ? (
          <div className="pointer-events-none absolute left-1/2 top-full z-40 mt-3 hidden w-[min(86vw,24rem)] -translate-x-1/2 opacity-0 transition group-hover/services:pointer-events-auto group-hover/services:block group-hover/services:opacity-100 group-focus-within/services:pointer-events-auto group-focus-within/services:block group-focus-within/services:opacity-100">
            <div className="rounded-[1.6rem] border border-black/8 bg-[rgba(255,255,255,0.95)] p-3 shadow-[0_28px_80px_rgba(17,17,17,0.14)] backdrop-blur">
              <div className="space-y-2">
                {serviceCategories.map((category) => (
                  <div
                    key={category.id || category.slug}
                    className="rounded-[1.2rem] border border-black/6 bg-[#fbfaf7] px-3 py-3"
                  >
                    <Link
                      href={`/about#category-${category.slug}`}
                      className="block font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/44"
                    >
                      {category.name}
                    </Link>
                    {category.services?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {category.services.map((service) => (
                          <Link
                            key={service.id || service.slug}
                            href={`/about#service-${service.slug}`}
                            className="inline-flex rounded-full border border-black/8 px-3 py-2 font-['Satoshi'] text-xs text-black/72 transition hover:border-black/16 hover:bg-white"
                          >
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={itemClass(
            link.href === "/"
              ? currentPath === "/"
              : currentPath === link.href || currentPath.startsWith(`${link.href}/`),
          )}
        >
          {link.label}
        </Link>
      ))}

      <Link href="/contact" className="ml-1 inline-flex min-h-11 items-center justify-center rounded-full bg-black px-4 py-2 font-['Satoshi'] text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-black/90">
        {contactCtaLabel}
      </Link>
    </nav>
  );
}
