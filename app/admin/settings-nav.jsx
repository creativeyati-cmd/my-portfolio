import Link from "next/link";

const SETTINGS_ITEMS = [
  ["general", "General"],
  ["content", "Content"],
  ["contact", "Contact"],
  ["booking", "Inquiries"],
  ["seo", "SEO"],
  ["account", "Account"],
];

export function getSettingsItems() {
  return SETTINGS_ITEMS.map(([key, label]) => ({ key, label }));
}

export default function SettingsNav({ current }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {SETTINGS_ITEMS.map(([key, label]) => {
        const active = current === key;

        return (
          <Link
            key={key}
            href={`/admin/settings/${key}`}
            className={`inline-flex items-center rounded-[10px] px-3 py-2 text-sm transition ${
              active
                ? "bg-[#202938] text-white"
                : "text-[#202938] hover:bg-black/4"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
