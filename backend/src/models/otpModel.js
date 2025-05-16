const { pool } = require('../config/db');

class Otp {
  static async create(userId, otpCode, expiresAt) {
    try {
        // Clean up expired OTPs
    //   await pool.query('DELETE FROM otps WHERE expires_at < NOW()'); 
      const query = 'INSERT INTO otps (user_id, otp_code, expires_at) VALUES ($1, $2, $3)';
      await pool.query(query, [userId, otpCode, expiresAt]);
    } catch (error) {
      console.error('Error in Otp.create:', error.message);
      throw new Error('Failed to create OTP');
    }
  }

  static async verify(userId, otpCode) {
    try {
      const result = await pool.query(
        'SELECT * FROM otps WHERE user_id = $1 AND otp_code = $2 AND expires_at > NOW() AND is_verified = FALSE',
        [userId, otpCode]
      );
      if (result.rowCount === 0) {
        throw new Error('Invalid or expired OTP');
      }
      await pool.query('UPDATE otps SET is_verified = TRUE WHERE user_id = $1 AND otp_code = $2', [
        userId,
        otpCode,
      ]);
      return true;
    } catch (error) {
      console.error('Error in Otp.verify:', error.message);
      throw error;
    }
  }
}

module.exports = Otp;