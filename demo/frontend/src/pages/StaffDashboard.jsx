import { useState, useEffect } from 'react';
import api from '../utils/api';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get('/orders/pending/all');
      setOrders(response.data);
    } catch (error) {
      setError('Failed to load pending orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/confirm`);
      alert('Order confirmed successfully!');
      fetchPendingOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to confirm order');
    }
  };

  const handleReject = async (orderId) => {
    if (!window.confirm('Are you sure you want to reject this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${orderId}/reject`);
      alert('Order rejected');
      fetchPendingOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject order');
    }
  };

  if (loading) {
    return <div className="loading">Loading pending orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Staff Dashboard - Pending Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card">
          <p>No pending orders at the moment.</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Customer: {order.user_name} ({order.user_email})
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Scheduled: {new Date(order.scheduled_date).toLocaleString()}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Created: {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className={`badge badge-${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="order-items">
              <h4>Items:</h4>
              {order.items && order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div>
                    <strong>{item.menu_item_name}</strong>
                    <div>Quantity: {item.quantity} | Serving: {item.serving_size}</div>
                  </div>
                  <div>€{item.price_at_time * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              Total: €{order.total_amount}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleConfirm(order.id)}
                className="btn btn-primary"
              >
                ✓ Confirm Order
              </button>
              <button
                onClick={() => handleReject(order.id)}
                className="btn btn-danger"
              >
                ✗ Reject Order
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StaffDashboard;

