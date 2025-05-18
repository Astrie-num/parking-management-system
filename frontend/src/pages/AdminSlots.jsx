import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSlots = () => {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ slot_number: '', floor: '', vehicle_type: '' });
  const [filters, setFilters] = useState({ vehicle_type: '', floor: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'delete'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();

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
      const response = await axios.get('http://localhost:8000/api/parking/slots', {
        params: filters,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetch slots response:', response.data.slots);
      setSlots(response.data.slots || []);
    } catch (error) {
      const errorMsg = error.response?.status === 401
        ? 'Session expired, please log in again'
        : error.response?.data?.error || 'Failed to fetch slots';
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
  }, [navigate, filters]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/parking/slots',
        {
          slot_number: form.slot_number,
          floor: parseInt(form.floor, 10),
          vehicle_type: form.vehicle_type,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Slot created successfully!');
      setForm({ slot_number: '', floor: '', vehicle_type: '' });
      setModalType(null);
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot');
      console.error('Create slot error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/parking/slots/${selectedSlot.id}`,
        {
          slot_number: form.slot_number,
          floor: parseInt(form.floor, 10),
          vehicle_type: form.vehicle_type,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Slot updated successfully!');
      setForm({ slot_number: '', floor: '', vehicle_type: '' });
      setModalType(null);
      setSelectedSlot(null);
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update slot');
      console.error('Update slot error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/parking/slots/${selectedSlot.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Slot deleted successfully!');
      setModalType(null);
      setSelectedSlot(null);
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete slot');
      console.error('Delete slot error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, slot = null) => {
    setModalType(type);
    setError('');
    setSuccess('');
    if (type === 'edit' && slot) {
      setSelectedSlot(slot);
      setForm({
        slot_number: slot.slot_number,
        floor: slot.floor.toString(),
        vehicle_type: slot.vehicle_type,
      });
    } else if (type === 'delete' && slot) {
      setSelectedSlot(slot);
    } else {
      setForm({ slot_number: '', floor: '', vehicle_type: '' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Parking Slots</h2>
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

      {/* Filters and Create Button */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={filters.vehicle_type}
              onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })}
            >
              <option value="">All</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Floor</label>
            <input
              type="number"
              className="p-2 border border-gray-300 rounded-lg"
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              placeholder="e.g., 1"
            />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => openModal('create')}
        >
          Create Slot
        </button>
      </div>

      {/* Slots Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Slot Number</th>
              <th className="px-4 py-2 border">Floor</th>
              <th className="px-4 py-2 border">Vehicle Type</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.length > 0 ? (
              slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{slot.id}</td>
                  <td className="px-4 py-2 border text-center">{slot.slot_number}</td>
                  <td className="px-4 py-2 border text-center">{slot.floor}</td>
                  <td className="px-4 py-2 border text-center capitalize">{slot.vehicle_type}</td>
                  <td className="px-4 py-2 border text-center capitalize">{slot.status}</td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                        onClick={() => openModal('edit', slot)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => openModal('delete', slot)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center px-4 py-4 text-gray-500">
                  No slots found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit/Delete */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {modalType === 'create' || modalType === 'edit' ? (
              <>
                <h3 className="text-xl font-bold mb-4">
                  {modalType === 'create' ? 'Create Slot' : 'Edit Slot'}
                </h3>
                <form onSubmit={modalType === 'create' ? handleCreateSlot : handleEditSlot} className="space-y-4">
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
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? 'Processing...' : modalType === 'create' ? 'Create Slot' : 'Update Slot'}
                    </button>
                    <button
                      className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      onClick={() => setModalType(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Delete Slot</h3>
                <p>Are you sure you want to delete slot {selectedSlot?.slot_number} on floor {selectedSlot?.floor}?</p>
                <div className="flex gap-4 mt-4">
                  <button
                    className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    onClick={handleDeleteSlot}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    onClick={() => setModalType(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlots;