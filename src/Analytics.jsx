import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Analytics.css';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { mockData } from './mockData';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

export default function Analytics() {
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [animatedSpent, setAnimatedSpent] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [combos, setCombos] = useState([]);
  const categoryColors = ['#c47b08', '#ffb52e', '#ffd182', '#ffe6a7'];

  // derived values
  const catTotal = topCategories.reduce((sum, c) => sum + (+c.total_revenue || 0), 0).toLocaleString();
  const centerText = `₱${catTotal}`;
  const charCount = centerText.length;
  const baseRem = 2;
  const shrinkFactor = 0.15;
  const fontSizeRem = Math.max(1, baseRem - (charCount - 3) * shrinkFactor);

  // ---- use mock data on mount ----
  useEffect(() => {
    // load analytics from mockData
    const a = mockData.analytics || {};

    setTopProducts(a.topProducts || []);
    setTopCategories(a.topCategories || []);
    setTopCustomers(a.topCustomers || []);
    setCombos(a.combos || []);
    setRecentOrders(a.recentOrders || []);

    // example: compute animatedSpent from topCustomers
    const totalSpent = (a.topCustomers || []).reduce((s, c) => s + (+c.total_spent || 0), 0);
    setAnimatedSpent(totalSpent);
  }, []);

  // chart data (unchanged logic)
  const prodDonutData = {
    labels: topProducts.map(p => p.product_name),
    datasets: [{
      data: topProducts.map(p => p.total_sold),
      backgroundColor: ['#c47b08', '#ffb52e', '#ffd182', '#ffe6a7'],
      borderWidth: 0,
    }]
  };

  const catDonutData = {
    labels: topCategories.map(c => c.category_name),
    datasets: [{
      data: topCategories.map(c => c.total_revenue),
      backgroundColor: ['#c47b08', '#ffb52e', '#ffd182', '#ffe6a7'],
      borderWidth: 0,
    }]
  };

  const custsBarData = {
    labels: topCustomers.map(c => c.full_name),
    datasets: [{
      label: '₱ Spent',
      data: topCustomers.map(c => c.total_spent),
      backgroundColor: topCustomers.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1
    }]
  };

  const MAX_CHARS = 20;
  const comboBarData = {
    labels: combos.map(c => {
      const full = `${c.product1_name} & ${c.product2_name}`;
      const chunks = full.match(new RegExp(`(.{1,${MAX_CHARS}})(\\s|$)`, 'g')) || [full];
      return chunks.map(s => s.trim());
    }),
    datasets: [{
      label: 'Times Bought Together',
      data: combos.map(c => c.count),
      backgroundColor: combos.map((_, i) => categoryColors[i % categoryColors.length]),
      borderColor: combos.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1
    }]
  };

  return (
    <div className='analytics-body'>
      <Navbar />
      <h2 className='analytics-title'>Analytics</h2>
      <div className='analytics-container'>
        <div className='analytics-cards'>
          <div className='analytics-graph'>
            {/* Top Products Donut */}
            <div className="card">
              <h3 className="card__title">Top Products Sold</h3>
              <div className="donut-container">
                <div className="donut-chart" style={{ height: 200 }}>
                  <Doughnut
                    data={prodDonutData}
                    options={{
                      maintainAspectRatio: false,
                      cutout: '60%',
                      rotation: -90,
                      plugins: { legend: { display: false }, tooltip: { enabled: true } }
                    }}
                  />
                </div>
                <div className="donut-center">
                  {topProducts.reduce((sum, p) => sum + (+p.total_sold || 0), 0)}
                </div>
              </div>

              <ul className="legend">
                {topProducts.map((p, i) => (
                  <li key={i} className="legend__item">
                    <span className={`legend__dot dot--${i + 1}`}></span>
                    {p.product_name} ({p.total_sold})
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Categories Donut */}
            <div className="card">
              <h3 className="card__title">Top Categories by Revenue</h3>
              <div className="donut-container">
                <Doughnut
                  data={catDonutData}
                  options={{
                    maintainAspectRatio: false,
                    cutout: '60%',
                    rotation: -90,
                    plugins: { legend: { display: false }, tooltip: { enabled: true } }
                  }}
                />
                <div className="donut-center" style={{ fontSize: `${fontSizeRem}rem` }}>
                  {centerText}
                </div>
              </div>
              <ul className="legend">
                {topCategories.map((c, i) => (
                  <li key={i} className="legend__item">
                    <span className={`legend__dot dot--${i + 1}`}></span>
                    {c.category_name} (₱{parseFloat(c.total_revenue).toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='analytics-stats'>
            {/* Top Customers */}
            <div className="card">
              <h3 className="card__title title3">Top 3 Customers</h3>
              {topCustomers.length > 0 ? (
                <div style={{ height: 150 }}>
                  <Bar
                    data={custsBarData}
                    options={{
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true, ticks: { callback: v => `₱${v}` } } },
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => `₱${ctx.parsed.y.toLocaleString()}` } }
                      }
                    }}
                  />
                </div>
              ) : (
                <p>No sales data yet.</p>
              )}
            </div>

            {/* Frequent Combos */}
            <div className="card">
              <h3 className="card__title">Frequently Bought Together</h3>
              <div style={{ height: 200 }}>
                {combos.length > 0 ? (
                  <Bar
                    data={comboBarData}
                    options={{
                      indexAxis: 'y',
                      maintainAspectRatio: false,
                      scales: { x: { beginAtZero: true }, y: { ticks: { autoSkip: false } } },
                      plugins: { legend: { display: false }, tooltip: { enabled: true } }
                    }}
                  />
                ) : (
                  <p className="muted">No frequent-combo data to display.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className='order-history'>
          <div className="orders-card">
            <div className="orders-card__header">
              <h3>Most Recent Orders</h3>
              <svg className="icon-clock" viewBox="0 0 24 24">
                <path d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ul className="orders-list">
              {recentOrders.map((order, idx) => (
                <li className="order-item" key={order.order_id ?? idx}>
                  <img
                    className="order-img"
                    src={resolveImage(order.product_img)}
                    alt={order.product_name}
                    onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
                  />

                  <div className="order-text">
                    <p className="order-title">{order.product_name}</p>
                    <p className="order-sub">
                      {order.quantity}× ordered by {order.full_name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="orders-card__footer">
              <Link to="/SellerOrderPage">
                <a href="#">View More Details</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
