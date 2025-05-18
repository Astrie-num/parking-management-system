import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/api/parking/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetch bookings response:', response.data.bookings);
      setBookings(response.data.bookings || []);
    } catch (error) {
      const errorMsg = error.response?.status === 401
        ? 'Session expired, please log in again'
        : error.response?.data?.error || 'Failed to fetch bookings';
      setError(errorMsg);
      console.error('Error fetching bookings:', error.response?.data?.error || error.message);
      setBookings([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const normalizeStatus = (status) => {
    if (status === 'active') return 'approved';
    if (status === 'cancelled') return 'rejected';
    return status;
  };

  const handleAction = async (bookingId, status, reason = '') => {
    console.log('HandleAction - Booking ID:', bookingId, 'Status:', status, 'Reason:', reason);
    if (!bookingId) {
      setError('Booking ID is undefined');
      console.error('Booking ID is undefined in handleAction');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/parking/bookings/${bookingId}`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Update booking response:', response.data);
      setSelectedBooking(null);
      setRejectionReason('');
      await fetchBookings();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update booking. Check email configuration or slot details.';
      setError(errorMsg);
      console.error('Update booking error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Booking Requests</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Booking ID</th>
              <th className="px-4 py-2 border">Slot Number</th>
              <th className="px-4 py-2 border">Floor</th>
              <th className="px-4 py-2 border">User Email</th>
              <th className="px-4 py-2 border">Vehicle Registration</th>
              <th className="px-4 py-2 border w-60">Start Time</th>
              <th className="px-4 py-2 border w-60">End Time</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{booking.id || 'N/A'}</td>
                  <td className="px-4 py-2 border text-center">{booking.slot_number || 'N/A'}</td>
                  <td className="px-4 py-2 border text-center">{booking.slot_location || 'N/A'}</td>
                  <td className="px-4 py-2 border text-center">{booking.email || 'N/A'}</td>
                  <td className="px-4 py-2 border text-center">{booking.vehicle_registration || 'N/A'}</td>
                  <td className="px-4 py-2 border text-center">{new Date(booking.start_time).toLocaleString()}</td>
                  <td className="px-4 py-2 border text-center">{new Date(booking.end_time).toLocaleString()}</td>
                  <td className="px-4 py-2 border text-center capitalize">{normalizeStatus(booking.status)}</td>
                  <td className="px-4 py-2 border text-center">
                    {booking.status === 'pending' && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            console.log('Approve clicked, id:', booking.id, 'booking:', booking);
                            if (!booking.id) {
                              console.error('Missing id for booking:', booking);
                              setError('Invalid booking ID');
                              return;
                            }
                            setSelectedBooking({ id: booking.id, status: 'approved' });
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            console.log('Reject clicked, id:', booking.id, 'booking:', booking);
                            if (!booking.id) {
                              console.error('Missing id for booking:', booking);
                              setError('Invalid booking ID');
                              return;
                            }
                            setSelectedBooking({ id: booking.id, status: 'rejected' });
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {(normalizeStatus(booking.status) === 'approved' || normalizeStatus(booking.status) === 'rejected') && (
                      <span className="text-gray-500">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center px-4 py-4 text-gray-500">
                  No booking requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Confirm {selectedBooking.status === 'approved' ? 'Approval' : 'Rejection'}
            </h3>
            <p>Are you sure you want to {selectedBooking.status} this booking?</p>
            {selectedBooking.status === 'rejected' && (
              <div className="mt-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                  Rejection Reason
                </label>
                <input
                  type="text"
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., No available slots"
                />
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  console.log('Confirm clicked, selectedBooking:', selectedBooking, 'Reason:', rejectionReason);
                  handleAction(selectedBooking.id, selectedBooking.status, rejectionReason);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setRejectionReason('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;