const Logs = require('../models/logsModel');

const getLogs = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: 'Invalid page or limit value' });
  }

  try {
    // Fetch logs using the model
    const logData = await Logs.findAll(page, limit, search);

    // Log the action using the model
    await Logs.create(userId, 'Logs list viewed');

    // Send response using the data from the model
    res.json({
      data: logData.logs,
      meta: {
        totalItems: logData.totalItems,
        currentPage: logData.currentPage,
        totalPages: logData.totalPages,
        limit: logData.limit,
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getLogs };