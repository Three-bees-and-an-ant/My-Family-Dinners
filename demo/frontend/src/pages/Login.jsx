import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      showSuccess('Login successful! Welcome back.');
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/menu');
      }, 100);
    } else {
      const errorMsg = result.error || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      showError(errorMsg);
    }

    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2 className="page-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@demo.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password123"
            />
          </div>
          {error && (
            <div className="error" style={{ 
              marginBottom: '15px', 
              padding: '12px', 
              backgroundColor: '#ffebee', 
              border: '1px solid #d32f2f',
              borderRadius: '4px'
            }}>
              {error}
              {(error.includes('MySQL') || error.includes('database') || error.includes('backend')) && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                  <strong>Quick Fix:</strong>
                  <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    <li>Start MySQL: <code>brew services start mysql</code></li>
                    <li>Start Backend: <code>cd backend && npm run dev</code></li>
                    <li>Seed Database: <code>cd backend && npm run seed</code></li>
                  </ol>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px', fontSize: '14px' }}>
          <strong>Demo Credentials:</strong><br />
          User: user@demo.com / password123<br />
          Staff: staff@demo.com / password123<br />
          Admin: admin@demo.com / password123
        </div>
      </div>
    </div>
  );
};

export default Login;

