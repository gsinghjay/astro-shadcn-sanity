export interface PortalUser {
  email: string;
}

export interface PortalNavItem {
  href: string;
  label: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}
