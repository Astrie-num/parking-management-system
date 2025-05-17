import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, logout } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <ul className="flex items-center space-x-4">
        <li><Link to="/" className="hover:underline">Home</Link></li>
        {authenticated ? (
          <>
            <li><Link to="/slots" className="hover:underline">Book Slot</Link></li>
            {admin && (
              <>
                <li><Link to="/admin/slots" className="hover:underline">Manage Slots</Link></li>
                <li><Link to="/dashboard/users" className="hover:underline">Users</Link></li>
                <li><Link to="/dashboard/logs" className="hover:underline">Logs</Link></li>
              </>
            )}
            <li className="ml-auto">
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/register" className="hover:underline">Register</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;