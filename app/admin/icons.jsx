import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChartBarLineIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  DashboardSquare02Icon,
  Delete02Icon,
  Edit01Icon,
  FilterHorizontalIcon,
  FolderDetailsIcon,
  Home01Icon,
  Link04Icon,
  Logout02Icon,
  Mail01Icon,
  Menu01Icon,
  MoreHorizontalCircle01Icon,
  Notification02Icon,
  PlayCircleIcon,
  Search01Icon,
  Settings02Icon,
  User03Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";

export const ADMIN_ICONS = {
  analytics: Analytics01Icon,
  archive: Cancel01Icon,
  arrow: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  calendar: Calendar03Icon,
  check: CheckmarkCircle02Icon,
  contact: Mail01Icon,
  content: Edit01Icon,
  copy: Copy01Icon,
  create: Add01Icon,
  dashboard: DashboardSquare02Icon,
  delete: Delete02Icon,
  filter: FilterHorizontalIcon,
  menu: Menu01Icon,
  more: MoreHorizontalCircle01Icon,
  notification: Notification02Icon,
  play: PlayCircleIcon,
  preview: Link04Icon,
  projects: FolderDetailsIcon,
  search: Search01Icon,
  settings: Settings02Icon,
  user: User03Icon,
  video: Video01Icon,
  view: Home01Icon,
  logout: Logout02Icon,
};

export function AdminIcon({
  icon,
  size = 18,
  strokeWidth = 1.6,
  className,
  color = "currentColor",
}) {
  const resolvedIcon = typeof icon === "string" ? ADMIN_ICONS[icon] : icon;

  if (!resolvedIcon) {
    return null;
  }

  return (
    <HugeiconsIcon
      icon={resolvedIcon}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
    />
  );
}
