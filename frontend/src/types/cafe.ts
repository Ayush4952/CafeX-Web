export type View = "home" | "menu" | "dashboard" | "orders" | "admin";

export type AuthMode = "login" | "register";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  badge?: string | null;
  prepMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
  category: string;
  categorySlug: string;
};

export type CafeUser = {
  id: number;
  fullName: string;
  email: string;
  role: "customer" | "admin";
};

export type Order = {
  id: number;
  orderNumber: string;
  status: string;
  fulfillment: string;
  total: number;
  createdAt: string;
  customerName?: string;
};

export type DashboardData = {
  summary: {
    menuItems: number;
    availableItems: number;
    ordersToday: number;
    revenueToday: number;
    customers: number;
  };
  recentOrders: Order[];
  categories: Array<{
    name: string;
    itemCount: number;
    availableCount: number;
  }>;
};
