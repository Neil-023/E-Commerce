import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProductPage.css';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mockData } from './mockData';

function AddProductPage() {
  const navigate = useNavigate();
  const [availableStock, setAvailableStock] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingCategoryName, setPendingCategoryName] = useState('');
  const [pendingCategoryIcon, setPendingCategoryIcon] = useState('more_horiz');

  // product form state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const availableIcons = [
    'local_pizza', 'local_cafe', 'fork_spoon', 'dinner_dining', 'icecream',
    'lunch_dining', 'cookie', 'local_bar', 'bakery_dining', 'kebab_dining',
    'skillet', 'room_service', 'soup_kitchen', 'stockpot', 'egg_alt', 'grocery',
    'blender', 'bento', 'outdoor_grill', 'restaurant', 'tapas', 'nutrition', 'brunch_dining'
  ];

  function handleImageUpload(e) {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // modal save: only stage values
  function handleSaveCategory() {
    if (!pendingCategoryName.trim()) {
      return;
    }
    setShowModal(false);
  }

  // Add Product: commit staged category (if any) then product
  function handleAddProduct() {
    let catId = categories[selectedIndex]?.category_id ?? null;

    if (pendingCategoryName.trim()) {
      const existingIndex = categories.findIndex(
        (cat) => cat.name.toLowerCase() === pendingCategoryName.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        setSelectedIndex(existingIndex);
        catId = categories[existingIndex].category_id;
      } else {
        catId = Date.now();
        const newCategory = {
          category_id: catId,
          name: pendingCategoryName,
          icon: pendingCategoryIcon,
        };

        setCategories((prev) => [
          ...prev.slice(0, -1),
          newCategory,
          prev[prev.length - 1],
        ]);
        setSelectedIndex(categories.length - 1);
      }
    }

    if (!productName || !productPrice || !productDescription || !availableStock || !catId) {
      toast.error('Please complete all fields before adding a product.', {
        style: {
          fontSize: '18px',
          minWidth: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      });
      return;
    }

    toast.success('Product added successfully! (demo)', {
      style: {
        fontSize: '20px',
        minWidth: '500px',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    });

    setProductName('');
    setProductPrice('');
    setProductDescription('');
    setAvailableStock('');
    setImageFile(null);
    setImagePreview(null);
    setPendingCategoryName('');
    setPendingCategoryIcon('more_horiz');
    setShowModal(false);
  }

  useEffect(() => {
    const baseCategories = mockData.category_tbl
      .slice(0, 4)
      .map((cat) => ({
        category_id: cat.category_id,
        name: cat.category_name,
        icon: cat.icon_name ?? 'more_horiz',
      }));

    const prefixedCategories = [
      ...baseCategories,
      { category_id: '__custom__', name: 'Other', icon: 'add' },
    ];

    setCategories(prefixedCategories);
    if (prefixedCategories.length) {
      setSelectedIndex(0);
    }
  }, []);

  return (
    <div className="add-product-page">
      <Navbar />
      <ToastContainer
        position="bottom-right"
        autoClose={6000}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
      />
      <div className="section1">
        <h2 className="add-product-title">Add New Product</h2>
        <p className="category-title">Category</p>
        <div className="category-container">
          {categories.map((cat, i) => (
            <button
              key={cat.category_id ?? i}
              className={`category-btn ${selectedIndex === i ? 'selected' : ''}`}
              onClick={() => {
                setSelectedIndex(i);
                if (cat.category_id === '__custom__') {
                  setShowModal(true);
                }
              }}
            >
              <span className="material-symbols-outlined">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <p className='details-title'>Product Details</p>
        <div className="details-container">
          <div className='input-container container1'>
            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input
                className="input-field"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Product Price</label>
              <input
                className="input-field"
                value={productPrice}
                onChange={e => setProductPrice(e.target.value)}
                placeholder="Enter product price"
              />
            </div>
          </div>
          <div className='input-container'>
            <div className="input-group">
              <label className="input-label">Product Description</label>
              <textarea
                className="input-field description-field"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>
            <div className="input-container">
              <div className="input-group stock-field">
                <label className="input-label">Available Stock</label>
                <input
                  className="input-field"
                  type="number"
                  value={availableStock}
                  onChange={e => setAvailableStock(e.target.value)}
                  placeholder="Enter available stock"
                  min="0" // Ensures only non-negative numbers
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add a New Category</h2>
            <div className="input-group">
              <label className="input-label">Category Name</label>
              <input
                className="input-field  cat-name"
                value={pendingCategoryName}
                onChange={e => setPendingCategoryName(e.target.value)}
                placeholder="e.g. ‘Snacks’"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Choose Icon</label>
              <div className="icon-grid">
                {availableIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${pendingCategoryIcon === icon ? 'selected' : ''}`}
                    onClick={() => setPendingCategoryIcon(icon)}
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button onClick={handleSaveCategory} className="add-product-btn">Save</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className='image-container'>
        <div className="image-container2" onClick={() => document.getElementById('imageInput').click()}>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          {imagePreview
            ? <img src={imagePreview} className="uploaded-image" alt="" />
            : <div className="upload-placeholder">
                <span className="material-symbols-outlined">image</span>
                <p>Click to upload image</p>
              </div>
          }
        </div>
        <div className='button-container'>
          <button onClick={handleAddProduct} className="add-product-btn">Add Product</button>
          <button className="cancel-btn" onClick={() => navigate('/MainPage')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddProductPage;
