import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Slots = () => {
  const [slotsData, setSlotsData] = useState({ slots: [], meta: {} });
  const [filters, setFilters] = useState({ vehicle_type: '', floor: '' });
  const [booking, setBooking] = useState({
    slot_id: '',
    vehicle_registration: '',
    vehicle_type: '',
    start_time: '',
    end_time: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const vehicleTypes = ['car', 'bike', 'truck'];

  const fetchSlots = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const params = {
        vehicle_type: filters.vehicle_type?.toLowerCase() || undefined,
        floor: filters.floor || undefined,
        page,
        limit,
      };
      console.log('Fetch params:', params); // Debug params
      const response = await axios.get('http://localhost:8000/api/parking/slots/available', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      console.log('Fetch response:', response.data); // Debug response
      setSlotsData(response.data || { slots: [], meta: {} });
      setError('');
    } catch (err) {
      const errorMsg = err.response?.status === 401
        ? 'Session expired, please log in again'
        : err.response?.data?.error || 'Failed to fetch available slots';
      setError(errorMsg);
      console.error('Fetch slots error:', err.response || err.message);
      setSlotsData({ slots: [], meta: {} });
    } finally {
      setLoading(false);
    }
  }, [filters.vehicle_type, filters.floor, page, limit, navigate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateBookingForm = () => {
    const { slot_id, vehicle_registration, vehicle_type, start_time, end_time } = booking;
    if (!slot_id || !vehicle_registration || !vehicle_type || !start_time || !end_time) {
      setError('All fields are required');
      return false;
    }
    if (!vehicleTypes.includes(vehicle_type)) {
      setError('Invalid vehicle type');
      return false;
    }
    if (!/^[A-Z0-9-]{1,20}$/.test(vehicle_registration)) {
      setError('Invalid vehicle registration format');
      return false;
    }
    const start = new Date(start_time);
    const end = new Date(end_time);
    const now = new Date();
    if (isNaN(start) || isNaN(end)) {
      setError('Invalid date/time');
      return false;
    }
    if (start < now) {
      setError('Start time cannot be in the past');
      return false;
    }
    if (end <= start) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateBookingForm()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/parking/bookings',
        {
          ...booking,
          start_time: new Date(booking.start_time).toISOString(),
          end_time: new Date(booking.end_time).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        setSuccess('Slot booked successfully! Redirecting...');
        setBooking({ slot_id: '', vehicle_registration: '', vehicle_type: '', start_time: '', end_time: '' });
        fetchSlots();
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(response.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book slot');
      console.error('Book slot error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (slotsData.meta.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const clearFilters = () => {
    setFilters({ vehicle_type: '', floor: '' });
    setPage(1);
  };

  const cancelBooking = () => {
    setBooking({ slot_id: '', vehicle_registration: '', vehicle_type: '', start_time: '', end_time: '' });
  };

  const slotsArray = Array.isArray(slotsData.slots) ? slotsData.slots : [];
  const selectedSlot = slotsArray.find((s) => s.id === booking.slot_id);
  const hasFilters = filters.vehicle_type || filters.floor;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white shadow-2xl rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Available Parking Slots</h2>
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
          <select
            id="vehicle_type"
            value={filters.vehicle_type}
            onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })}
            disabled={loading}
            className="w-full p-3 border rounded"
          >
            <option value="">All</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="floor" className="block text-sm font-medium text-gray-700">Floor</label>
          <input
            id="floor"
            type="number"
            value={filters.floor}
            onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
            disabled={loading}
            className="w-full p-3 border rounded"
            placeholder="Enter floor"
          />
        </div>
        <button
          className="self-end px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-400"
          onClick={clearFilters}
          disabled={loading || !hasFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Slot Table */}
      {slotsArray.length === 0 ? (
        <p className="text-center text-gray-500">
          {hasFilters
            ? `No slots found for Vehicle Type: "${filters.vehicle_type || 'Any'}", Floor: "${filters.floor || 'Any'}"`
            : 'No available slots'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <p className="text-gray-600 mb-2">Found {slotsArray.length} slot{slotsArray.length !== 1 ? 's' : ''}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Slot Number</th>
                <th className="p-3 text-left">Floor</th>
                <th className="p-3 text-left">Vehicle Type</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {slotsArray.map((slot) => (
                <tr key={slot.id} className="border-b">
                  <td className="p-3">{slot.slot_number}</td>
                  <td className="p-3">{slot.floor}</td>
                  <td className="p-3 capitalize">{slot.vehicle_type}</td>
                  <td className="p-3">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                      onClick={() => setBooking({ ...booking, slot_id: slot.id, vehicle_type: slot.vehicle_type })}
                      disabled={loading}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {slotsData.meta.totalPages > 1 && (
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-400"
              >
                Previous
              </button>
              <span>Page {page} of {slotsData.meta.totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === slotsData.meta.totalPages}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Form */}
      {booking.slot_id && (
        <form onSubmit={handleBookSlot} className="mt-8 space-y-4 border-t pt-6">
          <h3 className="text-xl font-semibold">Book Slot #{booking.slot_id}</h3>
          {selectedSlot && <p>Selected Slot: {selectedSlot.slot_number}</p>}
          <div>
            <label htmlFor="vehicle_registration" className="block text-sm font-medium text-gray-700">Vehicle Registration</label>
            <input
              id="vehicle_registration"
              type="text"
              placeholder="Vehicle Registration"
              className="w-full p-3 border rounded"
              value={booking.vehicle_registration}
              onChange={(e) => setBooking({ ...booking, vehicle_registration: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              id="start_time"
              type="datetime-local"
              className="w-full p-3 border rounded"
              value={booking.start_time}
              onChange={(e) => setBooking({ ...booking, start_time: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              id="end_time"
              type="datetime-local"
              className="w-full p-3 border rounded"
              value={booking.end_time}
              onChange={(e) => setBooking({ ...booking, end_time: e.target.value })}
            />
          </div>
          <div className="flex justify-between gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Book Slot
            </button>
            <button
              type="button"
              onClick={cancelBooking}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Slots;