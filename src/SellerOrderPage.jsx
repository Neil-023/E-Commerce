// SellerOrderPage.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import OrderHistoryCard from './components/OrderHistoryCard';
import './OrderHistory.css';
import './components/OrderHistoryCard.css';
import './components/OrderHistoryItem.css';
import { mockData } from './mockData';

const FALLBACK_IMAGE = 'https://via.placeholder.com/64x64?text=Food';
const resolveImage = (file) => {
  if (!file) {
    return FALLBACK_IMAGE;
  }
  try {
    if (file.startsWith('http')) {
      return file;
    }
    return new URL(`./assets/${file}`, import.meta.url).href;
  } catch {
    return FALLBACK_IMAGE;
  }
};

const ACTIVE_SELLER_ID = Number(localStorage.getItem('seller_id')) || 6;

function SellerOrderPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersById = new Map(mockData.orders_tbl.map((order) => [order.order_id, order]));
    const usersById = new Map(mockData.users_tbl.map((user) => [user.user_id, user]));
    const productsById = new Map(mockData.product_tbl.map((product) => [product.product_id, product]));

    const sellerEntries = mockData.order_seller_tbl.filter(
      (entry) => entry.seller_id === ACTIVE_SELLER_ID
    );

    const formatted = sellerEntries.map((entry) => {
      const baseOrder = ordersById.get(entry.order_id);
      const buyer = baseOrder ? usersById.get(baseOrder.buyer_id) : null;

      const items = mockData.order_items_tbl
        .filter((item) => item.order_id === entry.order_id)
        .map((item) => {
          const product = productsById.get(item.product_id);
          if (!product || product.seller_id !== ACTIVE_SELLER_ID) {
            return null;
          }
          return {
            product_id: product.product_id,
            product_name: product.product_name,
            product_img: resolveImage(product.product_img),
            quantity: item.quantity,
            price_each: item.price_each ?? product.price,
          };
        })
        .filter(Boolean);

      return {
        order_id: entry.order_id,
        ordered_at: baseOrder?.ordered_at ?? new Date().toISOString(),
        status: entry.status,
        customer_name: buyer?.full_name ?? 'Unknown Customer',
        isManager: true,
        items,
      };
    });

    setOrders(formatted);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  return (
    <div>
      <Navbar />
      <div className="order-history-body">
        <div className="order-history-container">
          <div className="order-history-title">My Shop's Orders</div>

          {orders.length === 0 && <p>No orders for your shop yet.</p>}

          {orders.map((order) => (
            <div key={order.order_id} className="order-group">
              <h2>
                Order #{order.order_id} — {new Date(order.ordered_at).toLocaleDateString()}
              </h2>

              <OrderHistoryCard
                id={order.order_id}
                shopname={order.customer_name}
                date={order.ordered_at}
                isManager={order.isManager}
                status={order.status}
                items={order.items}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SellerOrderPage;
