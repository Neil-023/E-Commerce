import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from './CartContext';
import Navbar from './Navbar';
import './MainPage.css';
import { mockData } from './mockData';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400?text=Food';
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

const CATEGORY_SWITCH_DELAY = 500;

function MainPage({ sellerId }) {
  const { cartBySeller, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [direction, setDirection] = useState('next');
  const [isExiting, setIsExiting] = useState(false);
  const [cardStartIndex, setCardStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const categorySwitchTimeout = useRef(null);

  const numericSellerId = sellerId ? Number(sellerId) : null;
  const categories = mockData.category_tbl;

  useEffect(() => {
    const filtered = mockData.product_tbl
      .filter((product) => (numericSellerId ? product.seller_id === numericSellerId : true))
      .map((product) => ({
        ...product,
        stock: product.avail_stocks,
        image: resolveImage(product.product_img),
      }));

    setProducts(filtered);
  }, [numericSellerId]);

  const availableCategories = useMemo(() => {
    const categoriesWithProducts = new Set(
      products.map((product) => String(product.category_id))
    );
    return categories.filter((cat) =>
      categoriesWithProducts.has(String(cat.category_id))
    );
  }, [categories, products]);

  useEffect(() => {
    if (!availableCategories.length) {
      setCategory('');
      return;
    }

    setCategory((current) => {
      const stillValid = availableCategories.some(
        (cat) => String(cat.category_id) === current
      );
      return stillValid ? current : String(availableCategories[0].category_id);
    });
  }, [availableCategories]);

  const items = useMemo(
    () => products.filter((product) => String(product.category_id) === category),
    [products, category]
  );
  const currentItem = items[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
    setPrevIndex(null);
    setCardStartIndex(0);
    setQuantity(1);
    setDirection('next');
    setIsExiting(false);
  }, [category]);

  useEffect(() => {
    if (!items.length) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  useEffect(() => {
    if (activeIndex < cardStartIndex) {
      setCardStartIndex(activeIndex);
    } else if (activeIndex >= cardStartIndex + 5) {
      setCardStartIndex(activeIndex - 4);
    }
  }, [activeIndex, cardStartIndex]);

  const cartItems = cartBySeller.flatMap((seller) => seller.items);
  const cartIds = useMemo(
    () => new Set(cartItems.map((item) => item.product_id)),
    [cartItems]
  );

  const isInCart = currentItem ? cartIds.has(currentItem.product_id) : false;
  const isOutOfStock = currentItem ? currentItem.stock <= 0 : true;
  const fullImageUrl = currentItem?.image ?? FALLBACK_IMAGE;

  const changeSlide = (dir) => {
    if (isExiting || items.length <= 1) {
      return;
    }
    setDirection(dir);
    setIsExiting(true);
    setPrevIndex(activeIndex);

    setTimeout(() => {
      setActiveIndex((prev) =>
        dir === 'next' ? (prev + 1) % items.length : (prev - 1 + items.length) % items.length
      );
      setIsExiting(false);
    }, 800);
  };

  const handlePreviewClick = (newIndex) => {
    if (isExiting || newIndex === activeIndex) {
      return;
    }
    setDirection(newIndex > activeIndex ? 'next' : 'prev');
    setIsExiting(true);
    setPrevIndex(activeIndex);

    setTimeout(() => {
      setActiveIndex(newIndex);
      setIsExiting(false);
    }, 800);
  };

  const handleAddToCart = (product) => {
    if (!product || product.stock <= 0) {
      return;
    }
    addToCart(product, quantity);
    setProducts((prev) =>
      prev.map((item) =>
        item.product_id === product.product_id
          ? { ...item, stock: Math.max(0, item.stock - quantity) }
          : item
      )
    );
    setQuantity(1);
  };

  const handleCategorySelect = (catId) => {
    if (category === catId || isExiting) {
      return;
    }

    if (categorySwitchTimeout.current) {
      clearTimeout(categorySwitchTimeout.current);
    }

    setPrevIndex(activeIndex);
    setDirection('next');
    setIsExiting(true);

    categorySwitchTimeout.current = setTimeout(() => {
      setCategory(catId);
      categorySwitchTimeout.current = null;
    }, CATEGORY_SWITCH_DELAY);
  };

  useEffect(() => {
    return () => {
      if (categorySwitchTimeout.current) {
        clearTimeout(categorySwitchTimeout.current);
      }
    };
  }, []);

  if (!availableCategories.length || !currentItem) {
    return (
      <div className="main-page">
        <Navbar />
        <p className="empty-state">No products available yet.</p>
      </div>
    );
  }

  const nameParts = currentItem.product_name?.split(' ') ?? [];
  const labelText = nameParts[1] || nameParts[0] || '';

  return (
    <div className="main-page">
      <Navbar />

      <div className="carousel-container">
        <div className="circle"></div>

        {isExiting && prevIndex !== null && (
          <div className={`slide exit ${direction}`}>
            <img
              src={items[prevIndex].image}
              alt={`Item ${prevIndex + 1}`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        )}

        {!isExiting && (
          <div className={`slide enter ${direction}`}>
            <img
              src={fullImageUrl}
              alt={`Item ${activeIndex + 1}`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        )}

        <div className="pizza-name">
          <h2>
            <span className="top-label">
              {`Top ${activeIndex + 1} Best Seller`.split('').map((char, i) => (
                <span
                  key={i}
                  className={`letter ${isExiting ? 'fade-out' : 'fade-in'} ${char === ' ' ? 'space' : ''
                    }`}
                  style={{ animationDelay: `${1000 + i * 30}ms` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>

            <br />
            <span className="pizza-title">
              {(nameParts[0] ?? '').split('').map((char, i) => (
                <span
                  key={i}
                  className={`letter ${isExiting ? 'fade-out' : 'fade-in'} ${char === ' ' ? 'space' : ''
                    }`}
                  style={{ animationDelay: `${1000 + i * 30}ms` }}
                >
                  {char}
                </span>
              ))}
            </span>
            <br />
            <span
              className="pizza-label"
              style={{
                fontSize: `${Math.max(1.2, 5.5 - 0.1 * (labelText.length - 6))}rem`,
                transition: 'font-size 0.3s ease',
              }}
            >
              {labelText.split('').map((char, i) => (
                <span
                  key={i}
                  className={`letter ${isExiting ? 'fade-out' : 'fade-in'}`}
                  style={{
                    animationDelay: `${1000 + (i + currentItem.product_name.length) * 30}ms`,
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>

      <div className="pizza-details-card">
        <p className="product-desc">Overview</p>

        <div className="price fade-in-up" key={`price-${activeIndex}`}>
          <p>₱{currentItem.price}</p>
        </div>

        <h3 className="fade-in-left" key={currentItem.product_name}>
          {currentItem.product_name}
        </h3>

        <p className="fade-in-left" key={`desc-${activeIndex}`}>
          {currentItem.product_desc}
        </p>
        <p>Stock left: {currentItem.stock}</p>

        <div className="quantity-container">
          <p>Quantity: </p>
          <div className="quantity-control">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((value) => Math.min(value + 1, currentItem.stock))}
              disabled={quantity >= currentItem.stock}
            >
              +
            </button>
          </div>
        </div>

        <button
          className="add-to-cart-btn"
          onClick={() => handleAddToCart(currentItem)}
          disabled={isExiting || isOutOfStock || isInCart}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {isOutOfStock ? 'Out of Stock' : isInCart ? 'Already in Cart' : 'Add to Cart'}
        </button>
      </div>

      <div className="bottom-carousel">
        <button className="small-nav" id="prev" onClick={() => changeSlide('prev')}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        {/* after: add key={category} so it remounts when category changes */}
        <div className="preview-cards" key={`previews-${category}`}>
          {items.slice(cardStartIndex, cardStartIndex + 5).map((pizza, index) => (
            <div
              key={`${pizza.product_id}-${category}`} // make sure keys are unique & include category
              className={`preview-card ${activeIndex === cardStartIndex + index ? 'active-preview' : ''}`}
              onClick={() => handlePreviewClick(cardStartIndex + index)}
            >
              <img
                src={pizza.image}
                alt={pizza.product_name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <p>{pizza.product_name}</p>
            </div>
          ))}
        </div>


        <button className="small-nav" id="next" onClick={() => changeSlide('next')}>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="dots-container">
        {items.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === activeIndex ? 'active-dot' : ''}`}
            onClick={() => handlePreviewClick(i)}
          />
        ))}
      </div>

      <div className="bottom-nav-bar">
        {availableCategories.map((cat) => (
          <button
            key={cat.category_id}
            className={`category-btn ${category === String(cat.category_id) ? 'active-category' : ''}`}
            onClick={() => handleCategorySelect(String(cat.category_id))}
          >
            <span className="material-symbols-outlined">{cat.icon_name}</span>
            {cat.category_name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
