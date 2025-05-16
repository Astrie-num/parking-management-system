const validateParams = (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: 'Invalid page or limit value' });
    }
    req.query.page = pageNum;
    req.query.limit = limitNum;
  
    if (req.params.id) {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      req.params.id = id;
    }
  
    next();
  };
  
  module.exports = validateParams;