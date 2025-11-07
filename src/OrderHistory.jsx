// OrderHistory.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import OrderHistoryCard from './components/OrderHistoryCard';
import './OrderHistory.css';
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

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const productsById = new Map(mockData.product_tbl.map((product) => [product.product_id, product]));
    const sellersById = new Map(mockData.users_tbl.map((user) => [user.user_id, user]));

    const formattedOrders = mockData.orders_tbl.map((order) => {
      const sellerEntries = mockData.order_seller_tbl.filter((entry) => entry.order_id === order.order_id);

      const itemsBySeller = new Map();
      mockData.order_items_tbl
        .filter((item) => item.order_id === order.order_id)
        .forEach((item) => {
          const product = productsById.get(item.product_id);
          if (!product) return;

          const sellerId = product.seller_id;
          if (!itemsBySeller.has(sellerId)) {
            itemsBySeller.set(sellerId, []);
          }
          itemsBySeller.get(sellerId).push({
            product_id: product.product_id,
            product_name: product.product_name,
            product_img: resolveImage(product.product_img),
            quantity: item.quantity,
            price_each: item.price_each ?? product.price,
          });
        });

      const shops = sellerEntries.map((entry) => {
        const seller = sellersById.get(entry.seller_id);
        return {
          seller_id: entry.seller_id,
          seller_name: seller?.shop_name ?? 'Unknown Seller',
          status: entry.status,
          items: itemsBySeller.get(entry.seller_id) ?? [],
        };
      });

      if (!shops.length) {
        itemsBySeller.forEach((items, sellerId) => {
          if (shops.some((shop) => shop.seller_id === sellerId)) return;
          const seller = sellersById.get(sellerId);
          shops.push({
            seller_id: sellerId,
            seller_name: seller?.shop_name ?? 'Unknown Seller',
            status: order.status,
            items,
          });
        });
      }

      return {
        ...order,
        overall_status: order.status,
        ordered_at: order.ordered_at ?? new Date().toISOString(),
        shops,
      };
    });

    setOrders(formattedOrders);
  }, []);                                            // run once on mount :contentReference[oaicite:2]{index=2}

  return (
    <div>
      <Navbar />
      <div className="order-history-body">
        <div className="order-history-container">
          <div className="order-history-title">Order History</div>

          {orders.length === 0 && <p>No past orders found.</p>}

          {orders.map(order => (
            <div key={order.order_id} className="order-group">
              <h2>
                Order #{order.order_id} — {new Date(order.ordered_at).toLocaleDateString()}
                {' '}<span className="status">{order.overall_status}</span>
              </h2>

              <div className="shops-list">
                {order.shops.map(shop => (
                  <OrderHistoryCard
                    key={shop.seller_id}
                    id={order.order_id}
                    shopname={shop.seller_name}
                    date={order.ordered_at}
                    status={shop.status}
                    items={shop.items}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
