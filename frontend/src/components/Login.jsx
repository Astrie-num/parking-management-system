import { useState } from 'react';
import axios from 'axios';
import { logout } from '../utils/auth';
import jwtDecode from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = () => {
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: form.email,
        password: form.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const userName = response.data.user.name;
        setSuccess(`Login successful! Welcome, ${userName}`);

        let decoded;
        try {
          decoded = jwtDecode(token);
        } catch (err) {
          console.error('Token decode error:', err.message);
          logout();
          setError('Invalid token received');
          setLoading(false);
          return;
        }

        const from = location.state?.from;
        let redirectTo;
        if (from && from !== '/login' && from !== '/register') {
          redirectTo = from; // Respect intended URL
        } else {
          redirectTo = decoded.role === 'admin' ? '/admin/dashboard' : '/slots';
        }

        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 2000);
      } else {
        setError(response.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Try again.');
      console.error('Login error:', err.response || err.message);
      logout(); // Clear any invalid token
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-2xl rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
      {success && (
        <p className="text-green-500 text-center mb-4">{success}</p>
      )}
      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}
      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading...</p>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., user@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
        </div>
        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Register
        </a>
      </p>
    </div>
  );
};

export default Login;