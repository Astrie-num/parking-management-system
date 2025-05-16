const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Logs = require('../models/logsModel');
const validateParams = require('../middleware/validateParams');

const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Logs.create(userId, 'User profile viewed');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.update(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Logs.create(userId, 'Profile updated');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message === 'No fields to update') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'A user with this email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getUsers = [
  validateParams,
  async (req, res) => {
    const userId = req.user.id;
    const { page, limit, search = '' } = req.query;

    try {
      const userData = await User.findAll(page, limit, search);
      await Logs.create(userId, 'Users list viewed');

      res.json({
        data: userData.users,
        meta: {
          totalItems: userData.totalItems,
          currentPage: userData.currentPage,
          totalPages: userData.totalPages,
          limit: userData.limit,
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  },
];

const deleteUser = [
  validateParams,
  async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      await User.delete(id);
      await Logs.create(userId, `User ${id} deleted`);
      res.json({ message: 'User deleted' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  },
];

module.exports = { getProfile, updateProfile, getUsers, deleteUser };