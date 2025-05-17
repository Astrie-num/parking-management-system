import { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const AdminSlots = () => {
  const [form, setForm] = useState({ slot_number: '', floor: '', vehicle_type: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

  const vehicleTypes = ['car', 'bike', 'truck'];

  const validateForm = () => {
    if (!form.slot_number || !form.floor || !form.vehicle_type) {
      setError('All fields are required');
      return false;
    }
    if (!/^[A-Z0-9-]{1,10}$/.test(form.slot_number)) {
      setError('Slot number must be 1-10 alphanumeric characters or hyphens');
      return false;
    }
    const floorNum = parseInt(form.floor, 10);
    if (isNaN(floorNum) || floorNum < 0) {
      setError('Floor must be a non-negative number');
      return false;
    }
    if (!vehicleTypes.includes(form.vehicle_type)) {
      setError('Invalid vehicle type');
      return false;
    }
    return true;
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/parking/slots', {
        slot_number: form.slot_number,
        floor: parseInt(form.floor, 10),
        vehicle_type: form.vehicle_type,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 201) {
        setSuccess('Slot created successfully!');
        setForm({ slot_number: '', floor: '', vehicle_type: '' });
      } else {
        setError(response.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot');
      console.error('Create slot error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-2xl rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Parking Slot</h2>
      {success && (
        <p className="text-green-500 text-center mb-4">{success}</p>
      )}
      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}
      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading...</p>
      )}
      <form onSubmit={handleCreateSlot} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slot Number</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., A1"
            value={form.slot_number}
            onChange={(e) => setForm({ ...form, slot_number: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Floor</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1"
            value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.vehicle_type}
            onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
            disabled={loading}
          >
            <option value="">Select</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creating...' : 'Create Slot'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Back to <a href="/admin/dashboard" className="text-blue-500 hover:underline">Admin Dashboard</a>
      </p>
    </div>
  );
};

export default AdminSlots;