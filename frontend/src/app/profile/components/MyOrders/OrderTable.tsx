// frontend/src/app/profile/components/MyOrders/OrderTable.tsx
"use client";

import React from "react";
import { Eye, Download } from "lucide-react";
import { Order } from "../../types";

interface OrderTableProps {
  orders: Order[];
  useMockData: boolean;
  onViewOrder: (id: string) => void;
  onDownloadInvoice: (id: string) => void;
  onCancelOrder: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatCurrency: (amount: number) => string;
}

export default function OrderTable({
  orders,
  useMockData,
  onViewOrder,
  onDownloadInvoice,

  getStatusColor,
  getStatusText,
  formatCurrency,
}: OrderTableProps) {
  return (
    <table className="w-full text-sm text-left">
      <thead className="text-gray-700 font-bold border-b border-gray-400 uppercase text-[12px]">
        <tr>
          <th className="p-5">Mã đơn hàng</th>
          <th className="p-5">Ngày đặt</th>
          <th className="p-5">Sản phẩm</th>
          <th className="p-5">Tổng tiền</th>
          <th className="p-5">Trạng thái</th>
          <th className="p-5">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-300">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-200 transition-colors">
            <td className="p-5 font-bold">
              <span className="inline-flex items-center gap-1">
                {order.order_number}
                {useMockData && (
                  <span className="text-xs text-gray-400">(Mock)</span>
                )}
              </span>
            </td>
            <td className="p-5">{order.created_at}</td>
            <td
              className="p-5 text-gray-600 max-w-xs truncate"
              title={order.items}
            >
              {order.items}
            </td>
            <td className="p-5 font-bold">
              {formatCurrency(order.total_amount)}
            </td>
            <td className="p-5">
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
            </td>
            <td className="p-5">
              <div className="flex gap-4">
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                  title="Xem chi tiết"
                >
                  <Eye size={18} />
                  <span className="text-xs font-medium">Xem</span>
                </button>
                <button
                  onClick={() => onDownloadInvoice(order.id)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-800 transition"
                  title="Tải hóa đơn"
                >
                  <Download size={18} />
                  <span className="text-xs font-medium">Hóa đơn</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
