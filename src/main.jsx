import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import MainPage from './MainPage.jsx';
import AddProductPage from './AddProductPage';
import CartPage from './CartPage';
import ApplySeller from './ApplySeller.jsx';
import SellerList from './SellerList.jsx';
import React from 'react';
import { CartProvider } from './CartContext';
import { SellerProvider } from './SellerContext.jsx';
import OrderHistory from './OrderHistory.jsx';
import MyProduct from './MyProduct';
import Analytics from './Analytics';
import SellerOrderPage from './SellerOrderPage.jsx';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SellerProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/OrderHistory" element={<OrderHistory />} />
            <Route path="/MyProduct" element={<MyProduct />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/ApplySeller" element={<ApplySeller />} />
            <Route path="/seller" element={<SellerList />} />
            <Route path="/seller/:sellerId" element={<DynamicSeller />} />
            <Route path="/SellerOrderPage" element={<SellerOrderPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SellerProvider>
  </React.StrictMode>
);

function DynamicSeller() {
  const { sellerId } = useParams();
  return <SellerList sellerId={sellerId} />;
}
