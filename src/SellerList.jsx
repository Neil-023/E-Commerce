import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainPage from './MainPage';
import './SellerList.css';
import Navbar from './Navbar.jsx';
import { mockData } from './mockData';

const FALLBACK_IMAGE = 'https://via.placeholder.com/200x200?text=Seller';
const resolveImage = (file) => {
  if (!file) {
    return FALLBACK_IMAGE;
  }
  try {
    return new URL(`./assets/${file}`, import.meta.url).href;
  } catch {
    return FALLBACK_IMAGE;
  }
};

export default function SellerList() {
  const { sellerId } = useParams();
  const [page, setPage] = useState(0);
  const perPage = 3;

  const sellers = useMemo(
    () =>
      mockData.users_tbl
        .filter((user) => user.role === 'seller')
        .map((seller) => ({
          user_id: seller.user_id,
          shop_name: seller.shop_name,
          shop_tagline: seller.shop_tagline,
          logo_url: resolveImage(seller.logo),
        })),
    []
  );

  if (sellerId) {
    return <MainPage sellerId={Number(sellerId)} />;
  }

  const totalPages = Math.max(1, Math.ceil(sellers.length / perPage));
  const start = Math.min(page, totalPages - 1) * perPage;
  const pageSellers = sellers.slice(start, start + perPage);

  if (!sellers.length) {
    return (
      <div className="seller-list">
        <Navbar />
        <p className="empty-state">No sellers available yet.</p>
      </div>
    );
  }

  return (
    <div className="seller-list">
      <Navbar />
      <div className="seller-intro">
        <div className="seller-text">
          <h2>
            Deliciously Curated
            <br />
            Foods for Every Diet
            <br />
            and Lifestyle
          </h2>
          <p>
            Choose meals that suit your health needs, dietary preferences, and whatever you crave—making
            everyday eating simple.
          </p>
        </div>
        <div className="seller-image">
          <img src={resolveImage('pizza3.png')} alt="Pizza" className="pizza-image" />
        </div>
      </div>

      <div className="seller-listview">
        <h2>Choose a Seller</h2>
        <div className="seller-buttons">
          <button disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
            ‹
          </button>

          {pageSellers.map((seller) => (
            <Link
              to={`/seller/${seller.user_id}`}
              key={seller.user_id}
              className="seller-button"
            >
              <img
                src={seller.logo_url}
                alt={seller.shop_name}
                className="seller-logo"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="seller-info">
                <h3>{seller.shop_name}</h3>
                <p>{seller.shop_tagline || 'Great food, great mood.'}</p>
              </div>
            </Link>
          ))}

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
