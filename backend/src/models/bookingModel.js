const { pool } = require('../config/db');

class Booking {
  static async create(bookingData) {
    console.log('Pool in create:', pool);
    const { user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time } = bookingData;
    const insertQuery = `
      INSERT INTO bookings (user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *, id AS booking_id;
    `;
    const values = [user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time];
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  }

  static async getAllBookings() {
    console.log('Pool in getAllBookings:', pool);
    const selectQuery = `
      SELECT b.*, b.id AS booking_id, s.slot_number, s.floor AS slot_location, u.email
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN users u ON b.user_id = u.id;
    `;
    try {
      const result = await pool.query(selectQuery);
      console.log('Bookings from DB:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  static async updateStatus(bookingId, status) {
    console.log('Pool in updateStatus:', pool);
    console.log('Booking ID:', bookingId, 'Status:', status);
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *, id AS booking_id, 
        (SELECT email FROM users u WHERE u.id = bookings.user_id) AS email,
        (SELECT slot_number FROM slots s WHERE s.id = bookings.slot_id) AS slot_number,
        (SELECT floor FROM slots s WHERE s.id = bookings.slot_id) AS slot_location;
    `;
    const result = await pool.query(updateQuery, [status, bookingId]);
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }
    console.log('Updated booking from DB:', result.rows[0]);
    return result.rows[0];
  }

  static async updateCompletedBookings() {
    console.log('Pool in updateCompletedBookings:', pool);
    const updateQuery = `
      UPDATE bookings
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active' AND end_time < CURRENT_TIMESTAMP;
    `;
    await pool.query(updateQuery);
  }
}

module.exports = Booking;