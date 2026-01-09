import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ScheduleMeal = () => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restaurantHours, setRestaurantHours] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantHours();
    // Get cart from localStorage or use empty array
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setItems(JSON.parse(cartData));
    }
  }, []);

  const fetchRestaurantHours = async () => {
    try {
      const response = await api.get('/scheduling/hours');
      setRestaurantHours(response.data);
    } catch (error) {
      console.error('Error fetching restaurant hours:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (items.length === 0) {
      setError('Please add items to your order');
      setLoading(false);
      return;
    }

    // Combine date and time
    const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;

    try {
      // Validate scheduled date
      const validateResponse = await api.post('/scheduling/validate', {
        scheduled_date: scheduledDateTime
      });

      if (!validateResponse.data.valid) {
        setError(validateResponse.data.error);
        setLoading(false);
        return;
      }

      // Create order
      const orderItems = items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        items: orderItems,
        scheduled_date: scheduledDateTime,
        is_scheduled: true
      });

      setSuccess(`Order #${response.data.id} created successfully!`);
      
      // Clear cart
      localStorage.removeItem('cart');
      setItems([]);

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
    }
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  // Calculate min and max dates (24h - 30 days)
  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const minDateStr = minDate.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Generate time slots (9:00 - 22:00)
  const timeSlots = [];
  for (let hour = 9; hour < 22; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
    timeSlots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
      <div className="card">
        <h2 className="page-title">Schedule Meal</h2>
        <p>Your cart is empty. Please add items from the menu first.</p>
        <Link to="/menu" className="btn btn-primary">Go to Menu</Link>
      </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Schedule Your Meal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2>Order Items</h2>
          {items.map(item => (
            <div key={item.id} className="order-item">
              <div>
                <strong>{item.name}</strong>
                <div>€{item.price} x {item.quantity}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px' }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px' }}
                >
                  +
                </button>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="btn btn-danger"
                  style={{ padding: '5px 10px', marginLeft: '10px' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="order-total">Total: €{getTotal()}</div>
        </div>

        <div className="card">
          <h2>Schedule Date & Time</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date (24h - 30 days ahead)</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={minDateStr}
                max={maxDateStr}
                required
              />
            </div>
            <div className="form-group">
              <label>Time (Restaurant hours: 09:00 - 22:00)</label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            {restaurantHours && (
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '14px' }}>
                Restaurant Hours: {restaurantHours.opening_hour} - {restaurantHours.closing_hour}
              </div>
            )}
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Order...' : 'Schedule Meal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeal;

