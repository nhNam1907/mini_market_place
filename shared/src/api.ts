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

export type SellerShop = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

export type SellerShopDetailResponse = {
  success: boolean;
  message: string;
  data: SellerShop;
};

export type UpdateSellerShopRequest = {
  name?: string;
  description?: string | null;
};

export type UpdateSellerShopResponse = SellerShopDetailResponse;

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
  images: SellerProductImage[];
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
  deletedAt: string | null;
  isActive: boolean;
};

export type SellerProductImage = {
  id: string;
  imageUrl: string;
  imageKey: string;
  sortOrder: number;
  createdAt: string;
};

export type SellerProductListResponse = {
  success: boolean;
  message: string;
  data: SellerProduct[];
};

export type SellerProductStatus = "active" | "inactive";

export type SellerProductListParams = {
  status?: SellerProductStatus;
};

export type SellerProductDetailResponse = {
  success: boolean;
  message: string;
  data: SellerProduct;
};

export type SellerOrderItemStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type SellerOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export type SellerOrderListParams = {
  pageNumber?: number;
  pageSize?: number;
  status?: SellerOrderItemStatus;
};

export type SellerOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: SellerOrderItemStatus;
  createdAt: string;
  updatedAt: string;
  lineTotal: number;
  order: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export type SellerOrderItemListResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
    items: SellerOrderItem[];
  };
};

export type UpdateSellerOrderItemStatusRequest = {
  status: SellerOrderItemStatus;
};

export type UpdateSellerOrderItemStatusResponse = {
  success: boolean;
  message: string;
  data: SellerOrderItem;
};

export type SellerOrderDetailItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: SellerOrderItemStatus;
  createdAt: string;
  updatedAt: string;
  lineTotal: number;
};

export type SellerOrderDetailResponse = {
  success: boolean;
  message: string;
  data: {
    orderItems: SellerOrderDetailItem[];
    order: {
      id: string;
      userId: string;
      status: SellerOrderStatus;
      createdAt: string;
      updatedAt: string;
      user: {
        name: string;
        email: string;
      };
    };
    totalItems: number;
    totalAmount: number;
  };
};

export type CreateSellerProductRequest = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
};

export type CreateSellerProductResponse = {
  success: boolean;
  message: string;
  data: SellerProduct;
};

export type UpdateSellerProductRequest = Partial<CreateSellerProductRequest>;

export type UpdateSellerProductResponse = {
  success: boolean;
  message: string;
  data: SellerProduct;
};

export type ReplaceSellerProductImagesResponse = {
  success: boolean;
  message: string;
  data: SellerProduct;
};

export type DeleteSellerProductResponse = {
  success: boolean;
  message: string;
};

export type RestoreSellerProductResponse = {
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
