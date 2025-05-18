// const {pool} = require('../config/db');

// const bulkCreateSlots = async (req, res) => {
//   const userId = req.user.id;
//   const { slots } = req.body;

//   if (!Array.isArray(slots) || slots.length === 0) {
//     return res.status(400).json({ error: 'Slots must be a non-empty array' });
//   }

//   try {
//     const values = slots.map(
//       (_, index) =>
//         `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
//     );

//     const flatValues = slots.flatMap((slot) => [
//       slot.slot_number,
//       slot.floor,
//       slot.vehicle_type,
//       'available',
//     ]);

//     const query = `
//       INSERT INTO slots (slot_number, floor, vehicle_type, status)
//       VALUES ${values.join(', ')}
//       RETURNING *;
//     `;

//     const result = await pool.query(query, flatValues);

//     await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
//       userId,
//       `Bulk created ${slots.length} slots`,
//     ]);

//     res.status(201).json(result.rows);
//   } catch (error) {
//     if (error.code === '23505') {
//       return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
//     }
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // const getSlots = async (req, res) => {
// //   const { page = 1, limit = 10, search = '' } = req.query;
// //   const offset = (page - 1) * limit;
// //   const isAdmin = req.user.role === 'admin';

// //   try {
// //     const searchQuery = `%${search}%`;
// //     const params = [searchQuery];
// //     let query = 'SELECT * FROM slots WHERE (slot_number ILIKE $1 OR vehicle_type ILIKE $1)';
// //     let countQuery = 'SELECT COUNT(*) FROM slots WHERE (slot_number ILIKE $1 OR vehicle_type ILIKE $1)';

// //     if (!isAdmin) {
// //       query += ' AND status = $2';
// //       countQuery += ' AND status = $2';
// //       params.push('available');
// //     }

// //     const countParams = [...params]; // For safe count query
// //     query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
// //     params.push(limit, offset);

// //     const countResult = await pool.query(countQuery, countParams);
// //     const totalItems = parseInt(countResult.rows[0].count, 10);

// //     const result = await pool.query(query, params);

// //     await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
// //       req.user.id,
// //       'Slots list viewed',
// //     ]);

// //     res.json({
// //       data: result.rows,
// //       meta: {
// //         totalItems,
// //         currentPage: parseInt(page, 10),
// //         totalPages: Math.ceil(totalItems / limit),
// //         limit: parseInt(limit, 10),
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // };


// // const SlotModel = require('../models/slotsModel');

// // const getSlotsAvalable = {
// //   async getAvailableSlots(req, res) {
// //     try {
// //       const { vehicle_type, floor, page, limit } = req.query;

// //       const data = await SlotModel.getAvailableSlots({ vehicle_type, floor, page, limit });

// //       res.status(200).json({
// //         message: 'Available slots retrieved successfully',
// //         ...data
// //       });
// //     } catch (error) {
// //       console.error('Controller error fetching available slots:', error.message);
// //       res.status(500).json({ error: 'Failed to fetch available slots' });
// //     }
// //   }
// // };

// const Slot = require('../models/slotsModel');

// const getAvailableSlots = async (req, res) => {
//   const { vehicle_type, floor, page, limit } = req.query;

//   if (vehicle_type && !['car', 'bike', 'truck'].includes(vehicle_type)) {
//     return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
//   }

//   try {
//     const slotsData = await Slot.getAvailableSlots({ vehicle_type, floor, page, limit });
//     console.log('Controller response data:', slotsData);
//     // Ensure the response is not nested
//     res.status(200).json({
//       slots: slotsData.slots,
//       meta: slotsData.meta,
//     });
//   } catch (error) {
//     console.error('Get available slots error:', error.message);
//     res.status(500).json({ error: error.message || 'Failed to fetch available slots' });
//   }
// };

// module.exports = { getAvailableSlots };

// const updateSlot = async (req, res) => {
//   const userId = req.user.id;
//   const { id } = req.params;
//   const { slot_number, floor, vehicle_type } = req.body;

//   try {
//     const result = await pool.query(
//       'UPDATE slots SET slot_number = $1, floor = $2, vehicle_type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
//       [slot_number, floor, vehicle_type, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Slot not found' });
//     }

//     await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
//       userId,
//       `Slot ${slot_number} updated`,
//     ]);

//     res.json(result.rows[0]);
//   } catch (error) {
//     if (error.code === '23505') {
//       return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
//     }
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const deleteSlot = async (req, res) => {
//   const userId = req.user.id;
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       'DELETE FROM slots WHERE id = $1 RETURNING slot_number',
//       [id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Slot not found' });
//     }

//     await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
//       userId,
//       `Slot ${result.rows[0].slot_number} deleted`,
//     ]);

//     res.json({ message: 'Slot deleted' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = { bulkCreateSlots, getAvailableSlots, updateSlot, deleteSlot };




const { pool } = require('../config/db');
const Slot = require('../models/slotsModel');

const bulkCreateSlots = async (req, res) => {
  const userEmail = req.user.email;
  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ error: 'Slots must be a non-empty array' });
  }

  try {
    const values = slots.map(
      (_, index) =>
        `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
    );

    const flatValues = slots.flatMap((slot) => [
      slot.slot_number,
      slot.floor,
      slot.vehicle_type,
      'available',
    ]);

    const query = `
      INSERT INTO slots (slot_number, floor, vehicle_type, status)
      VALUES ${values.join(', ')}
      RETURNING *;
    `;

    const result = await pool.query(query, flatValues);

    try {
      await pool.query('INSERT INTO logs (email, action) VALUES ($1, $2)', [
        userEmail,
        `Bulk created ${slots.length} slots`,
      ]);
    } catch (logError) {
      console.error('Error logging bulk create slots:', logError.message);
    }

    res.status(201).json(result.rows);
  } catch (error) {
    console.error('Bulk create slots error:', error.message);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const getAllSlots = async (req, res) => {
  const { vehicle_type, floor, page, limit } = req.query;

  if (vehicle_type && !['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  try {
    const slotsData = await Slot.getAllSlots({ vehicle_type, floor, page, limit });
    console.log('Controller response data:', slotsData);
    res.status(200).json({
      slots: slotsData.slots,
      meta: slotsData.meta,
    });
  } catch (error) {
    console.error('Get all slots error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch slots' });
  }
};

const getAvailableSlots = async (req, res) => {
  const { vehicle_type, floor, page, limit } = req.query;

  if (vehicle_type && !['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  try {
    const slotsData = await Slot.getAvailableSlots({ vehicle_type, floor, page, limit });
    console.log('Controller response data:', slotsData);
    res.status(200).json({
      slots: slotsData.slots,
      meta: slotsData.meta,
    });
  } catch (error) {
    console.error('Get available slots error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch available slots' });
  }
};

const updateSlot = async (req, res) => {
  const userEmail = req.user.email;
  const { id } = req.params;
  const { slot_number, floor, vehicle_type } = req.body;

  if (!slot_number || floor === undefined || !vehicle_type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  try {
    const slot = await Slot.updateSlot(id, { slot_number, floor, vehicle_type });

    try {
      await pool.query('INSERT INTO logs (email, action) VALUES ($1, $2)', [
        userEmail,
        `Slot ${slot_number} updated`,
      ]);
    } catch (logError) {
      console.error('Error logging slot update:', logError.message);
    }

    res.json(slot);
  } catch (error) {
    console.error('Update slot error:', error.message);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const deleteSlot = async (req, res) => {
  const userEmail = req.user.email;
  const { id } = req.params;

  try {
    const slot = await Slot.deleteSlot(id);

    try {
      await pool.query('INSERT INTO logs (email, action) VALUES ($1, $2)', [
        userEmail,
        `Slot ${slot.slot_number} deleted`,
      ]);
    } catch (logError) {
      console.error('Error logging slot deletion:', logError.message);
    }

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Delete slot error:', error.message);
    if (error.message === 'Slot not found') {
      return res.status(404).json({ error: 'Slot not found' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete slot with active bookings' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = { bulkCreateSlots, getAllSlots, getAvailableSlots, updateSlot, deleteSlot };