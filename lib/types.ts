import type { User, Shop, Product, Subscription, Plan, Payment, Category } from "@prisma/client";

export type { User, Shop, Product, Subscription, Plan, Payment, Category };

export type ShopWithSubscription = Shop & {
  user: {
    subscription: (Subscription & { plan: Plan }) | null;
  };
};

export type ShopWithProducts = Shop & {
  products: Product[];
  categories: Category[];
};

export type VendorWithShop = User & {
  shop: Shop | null;
  subscription: (Subscription & { plan: Plan }) | null;
};

export type PaymentWithDetails = Payment & {
  user: { name: string; email: string };
  subscription: (Subscription & { plan: Plan }) | null;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
