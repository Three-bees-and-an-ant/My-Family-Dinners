import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchMenuItems();
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching menu items from /api/menu...');
      const response = await api.get('/menu');
      
      // Debug: Log the full response
      console.log('Full API Response:', response);
      console.log('Response Data:', response.data);
      console.log('Response Status:', response.status);
      
      // Backend returns {success: true, data: [...], count: N}
      const data = response.data;
      
      // Handle different response formats - be very flexible
      let items = null;
      
      // Try all possible formats
      if (data && data.success !== undefined && Array.isArray(data.data)) {
        // Format: {success: true, data: [...], count: N}
        items = data.data;
        console.log('Found items in data.data format');
      } else if (Array.isArray(data)) {
        // Direct array format: [...]
        items = data;
        console.log('Found items as direct array');
      } else if (data && data.data && Array.isArray(data.data)) {
        // Nested: {data: [...]}
        items = data.data;
        console.log('Found items in nested data.data');
      } else if (data && data.items && Array.isArray(data.items)) {
        // Alternative: {items: [...]}
        items = data.items;
        console.log('Found items in data.items format');
      } else if (data && data.success && data.data === null) {
        // Empty response
        items = [];
        console.log('Empty menu items array');
      }
      
      // If we still don't have items, log and set error
      if (items === null) {
        console.error('❌ Could not parse menu items from response:', data);
        setError(`Menu items not available. Unexpected response format. Check console for details.`);
        setLoading(false);
        return;
      }
      
      // Set items or show error if empty
      if (items.length === 0) {
        console.warn('⚠️ Menu items array is empty');
        setError('No menu items found. Please check if database is seeded. Run: cd backend && npm run seed');
      } else {
        console.log(`✅ Successfully loaded ${items.length} menu items`);
        setMenuItems(items);
      }
    } catch (error) {
      console.error('❌ Error fetching menu:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // More specific error messages
      if (!error.response) {
        // Network error - backend not running
        setError('Cannot connect to server. Please ensure backend is running: cd backend && npm run dev');
      } else if (error.response.status === 500) {
        const serverError = error.response.data?.error || 'Server error';
        setError(`Server error: ${serverError}. Please check if MySQL is running and database is properly configured.`);
      } else if (error.response.status === 404) {
        setError('Menu endpoint not found. Please check backend server configuration.');
      } else if (error.response.status === 401) {
        setError('Authentication required. Please login again.');
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to load menu items';
        setError(`Failed to load menu items: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.id === item.id);
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(c => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }
    setCart(updatedCart);
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      const updatedCart = cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setCart(updatedCart);
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalCalories = () => {
    return cart.reduce((sum, item) => sum + ((item.calories || 0) * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center', padding: '40px' }}>
          <h2 className="page-title">Loading Menu...</h2>
          <div className="loading" style={{ fontSize: '18px', marginTop: '20px' }}>
            Please wait while we fetch the menu items...
          </div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            If this takes too long, check:
            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
              <li>Backend is running (port 3000)</li>
              <li>MySQL is running</li>
              <li>Database is seeded</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: '800px', margin: '50px auto', padding: '30px' }}>
          <h2 className="page-title" style={{ color: '#d32f2f' }}>⚠️ Menu Error</h2>
          <div className="error" style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            border: '1px solid #d32f2f',
            borderRadius: '4px',
            fontSize: '16px'
          }}>
            {error}
          </div>
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>🔧 Troubleshooting Steps:</h3>
            <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <li><strong>Check Backend:</strong> Open terminal and run <code>cd backend && npm run dev</code></li>
              <li><strong>Check MySQL:</strong> Run <code>brew services list | grep mysql</code> (Mac) or check Services (Windows)</li>
              <li><strong>Seed Database:</strong> Run <code>cd backend && npm run seed</code></li>
              <li><strong>Check Browser Console:</strong> Press F12 and look for error messages</li>
              <li><strong>Check Network Tab:</strong> In browser DevTools, see if API request is failing</li>
            </ol>
          </div>
          <button 
            onClick={() => {
              setError('');
              setLoading(true);
              fetchMenuItems();
            }}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  // Filter by category
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="page-container">
      <div className="menu-header">
        <h1 className="page-title">🍽️ Healthy Family Meals</h1>
        <p className="menu-subtitle">Nutritious meals for your busy family</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="menu-layout">
        <div className="menu-items-section">
          {filteredItems.length === 0 ? (
            <div className="no-items">No items found in this category.</div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map(item => (
                <div key={item.id} className="menu-item-card-modern">
                  {item.is_healthy && (
                    <div className="healthy-badge">🥗 Healthy</div>
                  )}
                  <div className="menu-item-image">
                    <div className="image-placeholder">
                      {item.name.charAt(0)}
                    </div>
                  </div>
                  <div className="menu-item-content">
                    <div className="menu-item-header">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <div className="menu-item-price">€{item.price}</div>
                    </div>
                    <p className="menu-item-description">{item.description}</p>
                    
                    {/* Nutritional Information */}
                    {item.calories && (
                      <div className="nutrition-info">
                        <div className="nutrition-grid">
                          <div className="nutrition-item">
                            <span className="nutrition-label">🔥 Calories</span>
                            <span className="nutrition-value">{item.calories}</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">💪 Protein</span>
                            <span className="nutrition-value">{item.protein_g}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">🍞 Carbs</span>
                            <span className="nutrition-value">{item.carbs_g}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">🥑 Fat</span>
                            <span className="nutrition-value">{item.fat_g}g</span>
                          </div>
                        </div>
                        {item.fiber_g > 0 && (
                          <div className="nutrition-extra">
                            <span>Fiber: {item.fiber_g}g</span>
                            {item.weight_g > 0 && <span>• Weight: {item.weight_g}g</span>}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="menu-item-footer">
                      <div className="menu-item-meta">
                        <span className="serving-size">🍽️ {item.serving_size}</span>
                        {item.prep_time_minutes && (
                          <span className="prep-time">⏱️ {item.prep_time_minutes} min</span>
                        )}
                      </div>
                      {item.allergens && item.allergens !== 'None' && (
                        <div className="allergens">⚠️ {item.allergens}</div>
                      )}
                      {isAuthenticated && user && user.role === 'user' && (
                        <button 
                          onClick={() => addToCart(item)}
                          className="btn btn-primary add-to-cart-btn"
                        >
                          ➕ Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && user && user.role === 'user' && (
          <div className="cart-section">
            <div className="cart-card-modern">
              <h3>🛒 Shopping Cart</h3>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                  <p className="cart-hint">Add healthy meals to plan your family's nutrition!</p>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item-modern">
                        <div className="cart-item-info">
                          <strong>{item.name}</strong>
                          <div className="cart-item-details">
                            €{item.price} x {item.quantity}
                            {item.calories && (
                              <span className="cart-calories"> • {item.calories * item.quantity} cal</span>
                            )}
                          </div>
                        </div>
                        <div className="cart-item-controls">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="btn-quantity"
                          >
                            −
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="btn-quantity"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="btn-remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <div className="cart-total-line">
                      <span>Total:</span>
                      <strong>€{getTotal()}</strong>
                    </div>
                    {getTotalCalories() > 0 && (
                      <div className="cart-calories-total">
                        Total Calories: <strong>{getTotalCalories()}</strong>
                      </div>
                    )}
                  </div>
                  <Link 
                    to="/schedule" 
                    className="btn btn-primary checkout-btn"
                  >
                    📅 Schedule Meal
                  </Link>
                  <Link 
                    to="/monthly-plan" 
                    className="btn btn-secondary monthly-plan-btn"
                  >
                    📆 Monthly Plan
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
