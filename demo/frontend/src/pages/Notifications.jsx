import { useState, useEffect } from 'react';
import api from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary">
            Mark All as Read ({unreadCount} unread)
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="card">
          <p>You have no notifications.</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            onClick={() => !notification.is_read && markAsRead(notification.id)}
            style={{ cursor: !notification.is_read ? 'pointer' : 'default' }}
          >
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {new Date(notification.createdAt).toLocaleString()}
              {!notification.is_read && (
                <span style={{ marginLeft: '10px', color: '#2196F3' }}>• Unread</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;

