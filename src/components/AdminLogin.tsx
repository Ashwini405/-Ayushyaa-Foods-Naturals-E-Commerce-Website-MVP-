import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await adminLogin(username, password);
      if (success) {
        navigate('/admin');
        setUsername('');
        setPassword('');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F3] flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-700 hover:text-[#9FC98D] transition"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-semibold">Back to Home</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Ayushyaa Foods & Naturals" className="h-32 w-auto object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Admin Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9FC98D] text-white py-3 rounded-lg font-semibold hover:bg-[#8BB87C] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
