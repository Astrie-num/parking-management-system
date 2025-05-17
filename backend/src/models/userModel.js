const { pool } = require('../config/db');

class Slot {
  static async create({ slot_number, floor, vehicle_type }) {
    try {
      const query = `
        INSERT INTO slots (slot_number, floor, vehicle_type)
        VALUES ($1, $2, $3)
        RETURNING id, slot_number, floor, vehicle_type, status, created_at;
      `;
      const result = await pool.query(query, [slot_number, floor, vehicle_type]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating slot:', error.message);
      throw new Error('Failed to create slot');
    }
  }

  static async getAvailableSlots({ vehicle_type, floor, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT id, slot_number, floor, vehicle_type, status
        FROM slots
        WHERE status = 'available'
      `;
      const params = [];
      let paramIndex = 1;

      if (vehicle_type) {
        query += ` AND vehicle_type = $${paramIndex++}`;
        params.push(vehicle_type);
      }
      if (floor !== undefined) {
        query += ` AND floor = $${paramIndex++}`;
        params.push(floor);
      }

      query += ` ORDER BY floor, slot_number LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const countQuery = `
        SELECT COUNT(*)
        FROM slots
        WHERE status = 'available'
      `;
      const countResult = await pool.query(countQuery);
      const totalItems = parseInt(countResult.rows[0].count);

      return {
        slots: result.rows,
        meta: {
          totalItems,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error('Error fetching available slots:', error.message);
      throw new Error('Failed to fetch available slots');
    }
  }
}

module.exports = Slot;