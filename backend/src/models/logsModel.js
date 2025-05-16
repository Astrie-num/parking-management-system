const { pool } = require('../config/db');

class Logs {
  static async create(email, action) {
    try {
      const query = 'INSERT INTO logs (email, action) VALUES ($1, $2) RETURNING *';
      const values = [email, action];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Logs.create:', error.message);
      throw new Error('Failed to create log');
    }
  }

  static async findAll(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = `%${search}%`;
      const query = `
        SELECT * FROM logs 
        WHERE action ILIKE $1 OR email::text ILIKE $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      const countQuery = `
        SELECT COUNT(*) FROM logs 
        WHERE action ILIKE $1 OR email::text ILIKE $1
      `;
      const values = [searchQuery, limit, offset];

      const countResult = await pool.query(countQuery, [searchQuery]);
      const result = await pool.query(query, values);

      return {
        logs: result.rows,
        totalItems: parseInt(countResult.rows[0].count),
        currentPage: parseInt(page),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in Logs.findAll:', error.message);
      throw new Error('Failed to fetch logs');
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM logs WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Logs.findById:', error.message);
      throw new Error('Failed to find log by ID');
    }
  }

  static async findByUserEmail(id) {
    try {
      const query = 'SELECT * FROM logs WHERE email = $1';
      const result = await pool.query(query, [id]);
      return result.rows; // Return all logs for the user (not just the first one)
    } catch (error) {
      console.error('Error in Logs.findByUserEmail:', error.message);
      throw new Error('Failed to find logs by user email');
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM logs WHERE id = $1';
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error in Logs.delete:', error.message);
      throw new Error('Failed to delete log');
    }
  }
}

module.exports = Logs;