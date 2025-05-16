// import React from 'react';
// import {Link} from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { removeToken } from '../utils/auth';

// const Navbar = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     removeToken();
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-primary text-white p-4 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//       <ul className="flex space-x-4" >
//         <li><Link to="/"> Home </Link></li>
//         <li><Link to="/register"> Register </Link></li>
//         <li><Link to="/login"> Login </Link></li>
//         <li>
//         <Link to="/dashboard" className="text-xl font-bold">
//           Parking Admin
//         </Link>
//         </li>

//         <div className="space-x-4">
//           <Link to="/dashboard" className="hover:text-accent">
//             Dashboard
//           </Link>
//           <Link to="/slot-requests" className="hover:text-accent">
//             Slot Requests
//           </Link>
//           <Link to="/logs" className="hover:text-accent">
//             Logs
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="bg-secondary px-3 py-1 rounded hover:bg-blue-600"
//           >
//             Logout
//           </button>
//         </div>
//       {/* </div> */}
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;


import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <ul className="flex space-x-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
