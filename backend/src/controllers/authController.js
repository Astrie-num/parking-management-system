const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/email');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const validateUser = require('../middleware/validateUser');


const register = [
  validateUser,
  async (req, res) => {
    const { name, email, password } = req.body;

    try {

      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create(name, email, hashedPassword, 'user', false);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      let sent;
      try {
        sent = await sendOtpEmail(email, otpCode);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }
      if (!sent) {
        return res.status(500).json({ message: 'Failed to send OTP' });
      }

      await Otp.create(email, otpCode, expiresAt);

      if (await User.hasAdmin()) {
        return res.status(403).json({ message: 'Admin already exists, only user role allowed' });
      }

      res.status(201).json({ message: 'OTP sent to email, please verify to complete registration', email });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
];




const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  try {
    const otpResult = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND expires_at > NOW() AND is_verified = FALSE',
      [email, otpCode]
    );

    if (otpResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE otps SET is_verified = TRUE WHERE email = $1 AND otp_code = $2', [
      email,
      otpCode,
    ]);

    await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);

    await pool.query('INSERT INTO logs (email, action) VALUES ($1, $2)', [
      email,
      'User verified OTP',
    ]);

    res.json({ message: 'OTP verified, user registration completed' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};



const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = FALSE', [
      email,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    const user = userResult.rows[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query('DELETE FROM otps WHERE user_id = $1', [email]);

    await pool.query(
      'INSERT INTO otps (user_id, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email, otpCode, expiresAt]
    );

    try {
      await sendOtpEmail(user.email, otpCode);
      console.log('Resent OTP email to:', user.email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: 'Failed to resend OTP email' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [
      email,
      'OTP resent',
    ]);

    res.json({ message: 'OTP resent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await pool.query('INSERT INTO logs (email, action) VALUES ($1, $2)', [
      email,
      'User logged in',
    ]);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { register, login, verifyOtp, resendOtp };