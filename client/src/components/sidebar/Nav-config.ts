import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Inbox,
  Gavel,
  Boxes,
  ClipboardList,
  ShoppingCart,
  Sprout,
  UserCheck,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";

export type UserRole = "farmer" | "aratdar" | "retailer" | "admin";

export interface NavItem {
  label: {
    en: string;
    bn: string;
  };
  href: string;
  icon: LucideIcon;
}

export const roleNavItems: Record<UserRole, NavItem[]> = {
  farmer: [
    {
      label: {
        en: "Dashboard",
        bn: "ড্যাশবোর্ড",
      },
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: {
        en: "My Products",
        bn: "আমার পণ্য",
      },
      href: "/my-products",
      icon: Package,
    },
    {
      label: {
        en: "Add Product",
        bn: "পণ্য যোগ করুন",
      },
      href: "/my-products/add",
      icon: PackagePlus,
    },
    {
      label: {
        en: "Receive Orders",
        bn: "প্রাপ্ত অর্ডার",
      },
      href: "/receive-order",
      icon: Inbox,
    },
  ],

  aratdar: [
    {
      label: {
        en: "Dashboard",
        bn: "ড্যাশবোর্ড",
      },
      href: "/aratdar",
      icon: LayoutDashboard,
    },
    {
      label: {
        en: "My Bidding Products",
        bn: "আমার বিডিং পণ্য",
      },
      href: "/aratdar/bidding-products",
      icon: Gavel,
    },
    {
      label: {
        en: "My Inventory",
        bn: "আমার মজুদ",
      },
      href: "/aratdar/inventory",
      icon: Boxes,
    },
    {
      label: {
        en: "Add Inventory",
        bn: "মজুদ যোগ করুন",
      },
      href: "/aratdar/inventory/add",
      icon: PackagePlus,
    },
    {
      label: {
        en: "Orders Placed",
        bn: "প্রেরিত অর্ডার",
      },
      href: "/aratdar/order/placed",
      icon: ClipboardList,
    },
    {
      label: {
        en: "Orders Received",
        bn: "প্রাপ্ত অর্ডার",
      },
      href: "/aratdar/order/received",
      icon: Inbox,
    },
  ],

  retailer: [
    {
      label: {
        en: "Dashboard",
        bn: "ড্যাশবোর্ড",
      },
      href: "/retailer",
      icon: LayoutDashboard,
    },
    {
      label: {
        en: "Orders",
        bn: "অর্ডার",
      },
      href: "/retailer/order",
      icon: ShoppingCart,
    },
  ],

  admin: [
    {
      label: {
        en: "Dashboard",
        bn: "ড্যাশবোর্ড",
      },
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: {
        en: "Create Crop",
        bn: "ফসল তৈরি করুন",
      },
      href: "/crop/create",
      icon: Sprout,
    },
    {
      label: {
        en: "Member Requests",
        bn: "সদস্যের অনুরোধ",
      },
      href: "/admin/members/request",
      icon: UserCheck,
    },
    {
      label: {
        en: "Reports",
        bn: "রিপোর্ট",
      },
      href: "/admin/reports",
      icon: FileBarChart,
    },
  ],
};