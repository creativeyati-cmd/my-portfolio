import Link from "next/link";

function itemClass(active) {
  return [
    "inline-flex items-center justify-center rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition sm:px-4 sm:text-[11px]",
    active
      ? "bg-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
      : "text-black/58 hover:bg-white/55 hover:text-black",
  ].join(" ");
}

export default function GlassNav({
  currentPath = "/",
  className = "",
  labels,
}) {
  const links = [
    { href: "/", label: labels?.navHomeLabel || "Home" },
    { href: "/projects", label: labels?.navProjectsLabel || "Projects" },
    { href: "/about", label: labels?.navAboutLabel || "About" },
    { href: "/contact", label: labels?.navContactLabel || "Contact" },
  ];

  return (
    <nav
      className={`glass-nav fixed left-1/2 top-4 z-30 flex w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 items-center justify-center gap-1 p-1.5 sm:top-[3.2vh] sm:w-auto ${className}`.trim()}
      aria-label="Primary"
    >
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
    </nav>
  );
}
