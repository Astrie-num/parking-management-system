import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [vehicleType, setVehicleType] = useState('');
  const [floor, setFloor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null); // Track the slot being booked
  const [bookingDetails, setBookingDetails] = useState({
    vehicle_registration: '',
    start_time: '',
    end_time: '',
  });
  const [bookingError, setBookingError] = useState('');
  const navigate = useNavigate();

  const fetchSlots = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Fetch params:', { vehicle_type: vehicleType, floor });
      const response = await axios.get('http://localhost:8000/api/parking/slots/available', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          vehicle_type: vehicleType || undefined,
          floor: floor || undefined,
        },
      });
      console.log('Full Fetch response:', JSON.stringify(response.data, null, 2));
      const slotsData = response.data.slots || response.data;
      const fetchedSlots = Array.isArray(slotsData.slots) ? slotsData.slots : (Array.isArray(slotsData) ? slotsData : []);
      console.log('Extracted slots array:', fetchedSlots);
      setSlots(fetchedSlots);
      console.log('Slots state after set:', fetchedSlots);
    } catch (error) {
      const errorMsg = error.response?.status === 401
        ? 'Session expired, please log in again'
        : error.response?.data?.error || 'Failed to fetch available slots';
      setError(errorMsg);
      console.error('Error fetching slots:', error.response?.data?.error || error.message);
      setSlots([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [vehicleType, floor, navigate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (error || bookingError) {
      const timer = setTimeout(() => {
        setError('');
        setBookingError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, bookingError]);

  const handleBookClick = (slot) => {
    setBookingSlot(slot);
    setBookingDetails({
      vehicle_registration: '',
      start_time: '',
      end_time: '',
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/parking/bookings',
        {
          slot_id: bookingSlot.id,
          vehicle_registration: bookingDetails.vehicle_registration,
          vehicle_type: bookingSlot.vehicle_type,
          start_time: bookingDetails.start_time,
          end_time: bookingDetails.end_time,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Booking response:', response.data);
      setBookingSlot(null); // Close modal
      fetchSlots(); // Refresh slots list
    } catch (error) {
      setBookingError(error.response?.data?.error || 'Failed to create booking');
      console.error('Booking error:', error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Available Parking Slots</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Vehicle Type (e.g., car, bike)"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Floor"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Slot Number</th>
              <th className="px-4 py-2 border">Floor</th>
              <th className="px-4 py-2 border">Vehicle Type</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.length > 0 ? (
              slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{slot.slot_number}</td>
                  <td className="px-4 py-2 border text-center">{slot.floor}</td>
                  <td className="px-4 py-2 border text-center capitalize">{slot.vehicle_type}</td>
                  <td className="px-4 py-2 border text-center">{slot.status}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleBookClick(slot)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      disabled={slot.status !== 'available'}
                    >
                      Book
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center px-4 py-4 text-gray-500">
                  {vehicleType || floor
                    ? `No slots found for Vehicle Type: "${vehicleType || 'Any'}", Floor: "${floor || 'Any'}"`
                    : 'No available slots'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Book Slot {bookingSlot.slot_number}</h3>
            {bookingError && <p className="text-red-500 mb-4">{bookingError}</p>}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Registration</label>
                <input
                  type="text"
                  value={bookingDetails.vehicle_registration}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, vehicle_registration: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="e.g., ABC123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={bookingDetails.start_time}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, start_time: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={bookingDetails.end_time}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, end_time: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slots;










