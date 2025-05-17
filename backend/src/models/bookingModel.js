const { pool } = require('../config/db');

class Booking {
  static async create({ user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time }) {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if slot is available
        const slotCheck = await client.query(
          'SELECT status FROM slots WHERE id = $1',
          [slot_id]
        );
        if (slotCheck.rows.length === 0 || slotCheck.rows[0].status !== 'available') {
          throw new Error('Slot is not available');
        }

        // Create booking
        const bookingQuery = `
          INSERT INTO bookings (user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, user_id, slot_id, vehicle_registration, vehicle_type, start_time, end_time, status, created_at;
        `;
        const bookingResult = await client.query(bookingQuery, [
          user_id,
          slot_id,
          vehicle_registration,
          vehicle_type,
          start_time,
          end_time,
        ]);

        // Update slot status
        await client.query(
          'UPDATE slots SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['occupied', slot_id]
        );

        await client.query('COMMIT');
        return bookingResult.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating booking:', error.message);
      throw new Error(error.message || 'Failed to create booking');
    }
  }
}

module.exports = Booking;