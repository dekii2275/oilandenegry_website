// types/order.ts

export type OrderStatus = "PENDING"|"CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  product_id: number;
  product_name: string;
  store_id?: number;
  store_name?: string;
  quantity: number;
  price: number;     // Backend là Decimal, Frontend nhận là number/string
  line_total: number;
}

export interface Order {
  order_id: number;
  user_id: number;
  // Lưu ý: Backend model OrderOut hiện tại chỉ có user_id. 
  // Bạn nên join bảng User ở backend để trả thêm customer_name.
  // Ở đây mình giả định bạn sẽ update backend trả thêm field này, hoặc mình hiển thị ID.
  customer_name?: string; 
  
  status: OrderStatus; // Map string từ backend sang type này
  customer_phone?: string;
  payment_method: "COD" | "QR";
  shipping_address: string;
  created_at: string; // ISO String

  subtotal: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;

  items: OrderItem[];
}