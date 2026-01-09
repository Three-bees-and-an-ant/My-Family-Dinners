import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'stats') {
        const [statsRes, statusRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/restaurant-status')
        ]);
        setStats(statsRes.data);
        setRestaurantStatus(statusRes.data);
      } else if (activeTab === 'logs') {
        const response = await api.get('/admin/logs?limit=100');
        setLogs(response.data);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } else if (activeTab === 'orders') {
        const response = await api.get('/admin/orders');
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRestaurant = async () => {
    try {
      const newStatus = !restaurantStatus.isEnabled;
      await api.put('/admin/restaurant-status', { isEnabled: newStatus });
      setRestaurantStatus({ isEnabled: newStatus });
      alert(`Restaurant ${newStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error) {
      alert('Failed to update restaurant status');
    }
  };

  if (loading && activeTab === 'stats') {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
        >
          System Logs
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Orders
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2>Restaurant Control</h2>
            <p>Status: <strong>{restaurantStatus?.isEnabled ? 'Enabled' : 'Disabled'}</strong></p>
            <button
              onClick={handleToggleRestaurant}
              className={`btn ${restaurantStatus?.isEnabled ? 'btn-danger' : 'btn-primary'}`}
            >
              {restaurantStatus?.isEnabled ? 'Disable Restaurant' : 'Enable Restaurant'}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{stats.totalOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Orders</div>
              <div className="stat-value">{stats.pendingOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Menu Items</div>
              <div className="stat-value">{stats.menuItems}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <h2>System Logs</h2>
          {loading ? (
            <div className="loading">Loading logs...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor Role</th>
                  <th>Actor ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.action}</td>
                    <td>{log.actor_role}</td>
                    <td>{log.actor_id || '-'}</td>
                    <td>{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2>All Users</h2>
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <h2>All Orders</h2>
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div>
              {orders.map(order => (
                <div key={order.id} className="order-card" style={{ marginBottom: '15px' }}>
                  <div className="order-header">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Customer: {order.user_name} ({order.user_email})
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Scheduled: {new Date(order.scheduled_date).toLocaleString()}
                      </div>
                    </div>
                    <span className={`badge badge-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div>Total: €{order.total_amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

