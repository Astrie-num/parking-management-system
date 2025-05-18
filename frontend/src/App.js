import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Slots from './pages/Slots';
import { isAdmin } from './utils/auth';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import {isAuthenticated} from './utils/auth';
import AdminBookings from './pages/AdminBookings';
import AdminSlots from './pages/AdminSlots';


const AuthenticatedRoute = ({ children }) => {
  const location = useLocation();
  console.log(`AuthenticatedRoute for ${location.pathname}, isAuthenticated?`, isAuthenticated());
  return isAuthenticated() ? children : <Navigate to="/login" state={{ from: location.pathname }} />;
};


const PrivateRoute = ({ children }) => {
  console.log("isAdmin?", isAdmin());
  return isAdmin() ? children : <Navigate to="/slots" />;
};


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content px-4 py-6">
          <Routes>

            <Route path='/' element={<Home />}></Route>
            <Route path='/register' element={<Register />}></Route>
            <Route path='/login' element={<Login />}></Route>

            <Route path="/slots" element={
              <AuthenticatedRoute>
                 <Slots />
              </AuthenticatedRoute>
            }
            />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
                <AdminBookings />
              </PrivateRoute>
              } />

            <Route path="/bookings" element={
              <PrivateRoute>
                <AdminBookings />
              </PrivateRoute>
            } />

           <Route path="/admin-slots" element={
              <PrivateRoute>
                <AdminSlots />
              </PrivateRoute>
            } />



            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
