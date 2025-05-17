const pool = require('../config/db');

const bulkCreateSlots = async (req, res) => {
  const userId = req.user.id;
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

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Bulk created ${slots.length} slots`,
    ]);

    res.status(201).json(result.rows);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const getSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role === 'admin';

  try {
    const searchQuery = `%${search}%`;
    const params = [searchQuery];
    let query = 'SELECT * FROM slots WHERE (slot_number ILIKE $1 OR vehicle_type ILIKE $1)';
    let countQuery = 'SELECT COUNT(*) FROM slots WHERE (slot_number ILIKE $1 OR vehicle_type ILIKE $1)';

    if (!isAdmin) {
      query += ' AND status = $2';
      countQuery += ' AND status = $2';
      params.push('available');
    }

    const countParams = [...params]; // For safe count query
    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(query, params);

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      req.user.id,
      'Slots list viewed',
    ]);

    res.json({
      data: result.rows,
      meta: {
        totalItems,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { slot_number, floor, vehicle_type } = req.body;

  try {
    const result = await pool.query(
      'UPDATE slots SET slot_number = $1, floor = $2, vehicle_type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [slot_number, floor, vehicle_type, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Slot ${slot_number} updated`,
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate slot number on the same floor' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM slots WHERE id = $1 RETURNING slot_number',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Slot ${result.rows[0].slot_number} deleted`,
    ]);

    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { bulkCreateSlots, getSlots, updateSlot, deleteSlot };
