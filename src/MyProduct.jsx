import React, { useMemo, useState } from 'react';
import Navbar from './Navbar';
import './MyProduct.css';
import { Link } from 'react-router-dom';
import { mockData } from './mockData';

const FALLBACK_IMAGE = 'https://via.placeholder.com/160x160?text=Product';
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

const ACTIVE_SELLER_ID = 1;

function MyProduct() {
  const initialProducts = useMemo(
    () =>
      mockData.product_tbl
        .filter((product) => product.seller_id === ACTIVE_SELLER_ID)
        .map((product) => ({
          ...product,
          product_img_url: resolveImage(product.product_img),
        })),
    []
  );

  const [products, setProducts] = useState(initialProducts);

  const handleRemove = (productId) => {
    if (!window.confirm('Remove this product?')) {
      return;
    }
    setProducts((prev) => prev.filter((product) => product.product_id !== productId));
  };

  const updateStock = (productId, operation) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.product_id !== productId) {
          return product;
        }
        const delta = operation === 'add' ? 1 : -1;
        return {
          ...product,
          avail_stocks: Math.max(0, product.avail_stocks + delta),
        };
      })
    );
  };

  return (
    <div className="myproduct-body">
      <Navbar />
      <div className="myproduct-container">
        <div className="myproduct-header">
          <h2>My Products</h2>
          <Link to="/add-product">
            <button className="addproduct-btn">Add Product</button>
          </Link>
        </div>

        <div className="myproduct-contents">
          {products.length === 0 && <p>No products yet.</p>}

          {products.map((product) => (
            <div className="cart-card2" key={product.product_id}>
              <img
                src={resolveImage(product.product_img)}
                alt={product.product_name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="cart-card-details2">
                <div className="cart-header2">
                  <h3 className="cart-pizza-name2">{product.product_name}</h3>
                  <h4>
                    {mockData.category_tbl.find((cat) => cat.category_id === product.category_id)
                      ?.category_name || 'Uncategorized'}
                  </h4>
                </div>

                <div className="cart-card-info2">
                  <div>
                    <div className="price-div">
                      <p>Price</p>
                      <p>
                        <b>₱{product.price}</b>
                      </p>
                    </div>
                    <p>Stock</p>
                    <div className="stock-counter">
                      <button onClick={() => updateStock(product.product_id, 'subtract')}>-</button>
                      <p>{product.avail_stocks}</p>
                      <button onClick={() => updateStock(product.product_id, 'add')}>+</button>
                    </div>
                  </div>

                  <div className="line"></div>

                  <div className="product-date">
                    <div>
                      Added at
                      <br />
                      {new Date().toLocaleDateString()}
                    </div>
                    <div>
                      Updated at
                      <br />
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  className="removeproduct-btn"
                  onClick={() => handleRemove(product.product_id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyProduct;
