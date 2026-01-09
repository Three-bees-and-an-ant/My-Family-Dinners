import { useState, useEffect } from 'react';
import api from '../utils/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${orderId}/cancel`);
      fetchOrders(); // Refresh orders
      alert('Order cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card">
          <p>You have no orders yet.</p>
          <a href="/menu" className="btn btn-primary">Browse Menu</a>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Scheduled: {new Date(order.scheduled_date).toLocaleString()}
                </div>
              </div>
              <div>
                <span className={`badge badge-${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="btn btn-danger"
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
            <div className="order-items">
              <h4>Items:</h4>
              {order.items && order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div>
                    <strong>{item.menu_item_name || item.name}</strong>
                    <div>Quantity: {item.quantity}</div>
                  </div>
                  <div>€{(item.price_at_time || item.price) * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              Total: €{order.total_amount}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Created: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;

