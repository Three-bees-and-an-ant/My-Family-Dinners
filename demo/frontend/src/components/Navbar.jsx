import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🍽️ The Family Meals
          </Link>
          
          <div className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link to="/menu">Menu</Link>
                {user.role === 'user' && (
                  <>
                    <Link to="/schedule">Schedule Meal</Link>
                    <Link to="/monthly-plan">Monthly Plan</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/notifications">
                      Notifications
                      {user.unreadCount > 0 && (
                        <span className="badge">{user.unreadCount}</span>
                      )}
                    </Link>
                  </>
                )}
                {(user.role === 'staff' || user.role === 'admin') && (
                  <Link to="/staff">Staff Dashboard</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin">Admin Panel</Link>
                )}
                <span className="user-info">
                  {user.email} ({user.role})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/menu">Menu</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

