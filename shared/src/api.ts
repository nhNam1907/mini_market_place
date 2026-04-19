export type HealthResponse = {
  success: boolean;
  message: string;
  timestamp: string;
};

export type UserRole = "ADMIN" | "USER" | "SELLER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginSuccessResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
};

export type MeSuccessResponse = {
  success: boolean;
  message: string;
  data: AuthUser;
};

export type RegisterSuccessResponse = {
  success: boolean;
  message: string;
  data: AuthUser;
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type CategoryListResponse = {
  success: boolean;
  message: string;
  data: CategoryOption[];
};

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
};

export type PublicProductDetailResponse = {
  success: boolean;
  message: string;
  data: PublicProduct;
};

export type PublicProductSortBy = "createdAt" | "price" | "name";
export type PublicProductSortOrder = "asc" | "desc";

export type PublicProductListParams = {
  categoryId?: string;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: PublicProductSortBy;
  sortOrder?: PublicProductSortOrder;
};

export type PublicProductListResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
    products: PublicProduct[];
  };
};

export type PublicShop = {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
  };
};

export type PublicShopDetailResponse = {
  success: boolean;
  message: string;
  data: PublicShop;
};

export type PublicShopProductListResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
    products: PublicProduct[];
  };
};

export type CartItemProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
};

export type CartItem = {
  id: string;
  quantity: number;
  lineTotal: number;
  product: CartItemProduct;
};

export type CartData = {
  id: string | null;
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: number;
  };
};

export type CartResponse = {
  success: boolean;
  message: string;
  data: CartData;
};

export type AddCartItemRequest = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

export type CartItemActionResponse = {
  success: boolean;
  message: string;
  data: CartItem;
};

export type AddCartItemResponse = CartItemActionResponse;
export type UpdateCartItemResponse = CartItemActionResponse;
export type RemoveCartItemResponse = CartItemActionResponse;

export type CheckoutOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  shopId: string;
  shopName: string;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
};

export type CheckoutOrder = {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: CheckoutOrderItem[];
};

export type CheckoutResponse = {
  success: boolean;
  message: string;
  data: CheckoutOrder | null;
};

export type UserOrderListParams = {
  pageNumber?: number;
  pageSize?: number;
};

export type UserOrderListResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      pageNumber: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
    orders: CheckoutOrder[];
  };
};

export type UserOrderDetailResponse = {
  success: boolean;
  message: string;
  data: CheckoutOrder;
};

export type CancelOrderResponse = UserOrderDetailResponse;
export type CancelOrderItemResponse = UserOrderDetailResponse;

export type SellerProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type SellerProductListResponse = {
  success: boolean;
  message: string;
  data: SellerProduct[];
};

export type CreateSellerProductRequest = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
};

export type CreateSellerProductResponse = {
  success: boolean;
  message: string;
  data: SellerProduct;
};

export type ProductSummary = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

export type OrderStatus = "Pending" | "Shipping" | "Completed";

export type OrderSummary = {
  id: string;
  customer: string;
  status: OrderStatus;
};
