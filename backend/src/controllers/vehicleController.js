const pool = require('../config/db');

const createVehicle = async (req, res) => {
  const userId = req.user.id;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vehicles (user_id, plate_number, vehicle_type, size, other_attributes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, plate_number, vehicle_type, size, other_attributes || {}]
    );
    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Vehicle ${plate_number} created`,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};

const getVehicles = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  try {
    const searchQuery = `%${search}%`;
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM vehicles WHERE user_id = $1 AND (plate_number ILIKE $2 OR vehicle_type ILIKE $2)',
      [userId, searchQuery]
    );
    const totalItems = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM vehicles WHERE user_id = $1 AND (plate_number ILIKE $2 OR vehicle_type ILIKE $2) ORDER BY id LIMIT $3 OFFSET $4',
      [userId, searchQuery, limit, offset]
    );

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      'Vehicles list viewed',
    ]);
    res.json({
      data: result.rows,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vehicles SET plate_number = $1, vehicle_type = $2, size = $3, other_attributes = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [plate_number, vehicle_type, size, other_attributes || {}, id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Vehicle ${plate_number} updated`,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};

const deleteVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING plate_number',
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      userId,
      `Vehicle ${result.rows[0].plate_number} deleted`,
    ]);
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports ={ createVehicle, getVehicles, updateVehicle, deleteVehicle}