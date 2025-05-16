// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { login } from '../utils/api';
// // import { setToken } from '../utils/auth';

// // const Login = () => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');
// //   const navigate = useNavigate();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');
// //     try {
// //       const response = await login(email, password);
// //       setToken(response.data.token);
// //       navigate('/dashboard');
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Login failed');
// //     }
// //   };

// //   return (
// //     <div className="flex items-center justify-center min-h-screen bg-accent">
// //       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
// //         <h2 className="text-3xl font-bold text-primary mb-6 text-center">Admin Login</h2>
// //         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
// //         <form onSubmit={handleSubmit}>
// //           <div className="mb-4">
// //             <label className="block text-gray-700 mb-2" htmlFor="email">
// //               Email
// //             </label>
// //             <input
// //               type="email"
// //               id="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               className="input"
// //               required
// //             />
// //           </div>
// //           <div className="mb-6">
// //             <label className="block text-gray-700 mb-2" htmlFor="password">
// //               Password
// //             </label>
// //             <input
// //               type="password"
// //               id="password"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               className="input"
// //               required
// //             />
// //           </div>
// //           <button type="submit" className="btn-primary w-full">
// //             Login
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;




// import React, { useState } from 'react';
// import axios from 'axios';

// function Login() {
//     const [form, setForm] = useState({ email: '', password: '' });
//     const [otp, setOtp] = useState('');
//     const [error, setError] = useState('');
//     const [otpSent, setOtpSent] = useState(false);
//     const [loading, setLoading] = useState(false);

//     // Client-side validation
//     const validateForm = () => {
//         if (!form.email || !form.password) {
//             setError('Email and password are required');
//             return false;
//         }
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//             setError('Invalid email format');
//             return false;
//         }
//         return true;
//     };

//     const handleLogin = async () => {
//         setError('');
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             const response = await axios.post('http://localhost:5000/api/login', {
//                 email: form.email,
//                 password: form.password,
//             }, {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             if (response.status === 200) {
//                 setOtpSent(true);
//                 setError('OTP sent to your email. Please verify.');
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
//             console.error('Login error:', err.response || err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleVerify = async () => {
//         setError('');
//         setLoading(true);
//         try {
//             const response = await axios.post('http://localhost:5000/api/verify-login', {
//                 email: form.email,
//                 otp,
//             }, {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             if (response.status === 200) {
//                 localStorage.setItem('token', response.data.token);
//                 localStorage.setItem('role', response.data.user.role);
//                 console.log('Login response:', response.data);
//                 setError('Logged in successfully! Redirecting...');
//                 const redirectPath = response.data.user.role.toLowerCase() === 'admin' ? '/dashboard' : '/';
//                 setTimeout(() => (window.location.href = redirectPath), 1000);
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Verification failed. Try again.');
//             console.error('Verify error:', err.response || err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
//             {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//             {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}
//             <div className="space-y-4">
//                 <input
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Email"
//                     value={form.email}
//                     onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 />
//                 <input
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     type="password"
//                     placeholder="Password"
//                     value={form.password}
//                     onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 />
//                 <button
//                     className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
//                     onClick={handleLogin}
//                     disabled={loading}
//                 >
//                     {loading ? 'Sending...' : 'Send OTP'}
//                 </button>
//                 {otpSent && (
//                     <>
//                         <input
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter OTP"
//                             value={otp}
//                             onChange={(e) => setOtp(e.target.value)}
//                         />
//                         <button
//                             className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
//                             onClick={handleVerify}
//                             disabled={loading || !otp}
//                         >
//                             {loading ? 'Verifying...' : 'Verify OTP'}
//                         </button>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Login;



import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (response.status === 200) {
        setSuccess(`Login successful! Welcome, ${response.data.user.name}`);
        localStorage.setItem('token', response.data.token);
        setTimeout(() => {
          window.location.href = '/dashboard'; // Adjust to match your routing
        }, 2000);
      } else {
        setError(response.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Try again.');
      console.error('Login error:', err.response || err.message);
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
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
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
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;