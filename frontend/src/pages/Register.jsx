// import React, { useState } from 'react';
// import axios from 'axios';

// function Register() {
//     const [form, setForm] = useState({ name: '', email: '', password: '' });
//     const [otp, setOtp] = useState('');
//     const [error, setError] = useState('');
//     const [otpSent, setOtpSent] = useState(false);
//     const [loading, setLoading] = useState(false);

//     // Client-side validation to match backend rules
//     const validateForm = () => {
//         if (!form.name || !form.email || !form.password) {
//             setError('All fields are required');
//             return false;
//         }
//         if (!/^[a-zA-Z\s]{2,50}$/.test(form.name)) {
//             setError('Name must be 2-50 characters long and contain only letters and spaces');
//             return false;
//         }
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//             setError('Invalid email format');
//             return false;
//         }
//         if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
//             setError('Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
//             return false;
//         }
//         return true;
//     };

//     const handleRegister = async () => {
//         setError('');
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             const response = await axios.post('http://localhost:5000/api/register', {
//                 name: form.name,
//                 email: form.email,
//                 password: form.password
//             }, {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             if (response.status === 200) {
//                 setOtpSent(true);
//                 setError('OTP sent to your email. Please verify.');
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
//             console.error('Register error:', err.response || err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleVerify = async () => {
//         setError('');
//         setLoading(true);
//         try {
//             const response = await axios.post('http://localhost:5000/api/verify-otp', {
//                 name: form.name,
//                 email: form.email,
//                 password: form.password,
//                 otp
//             }, {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             if (response.status === 201) {
//                 localStorage.setItem('token', response.data.token);
//                 setError('Registered successfully! Redirecting...');
//                 setTimeout(() => (window.location.href = '/login'), 1000);
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
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h2>
//             {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//             {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}
//             <div className="space-y-4">
//                 <input
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Name"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 />
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
//                     onClick={handleRegister}
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

// export default Register;