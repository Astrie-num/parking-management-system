// const { pool } = require('../config/db');


// class User{
//     static async create(name, email, password, role){
//         try{
//             const query = ('INSERT INTO students (name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *');
//             const values = [name, email, password, role];
//             const result = await pool.query(query, values);
//             return result.rows[0];
//         }catch(error){
//             console.error('Error in user.create:', error.message);
//             if(error.code === '23505'){
//                 throw new Error('A user with this email already exists');
//             }

//             throw new Error('Failed to create user');
//         }
            
//     }

//     static async findAll(page=1,  limit=5, search='') {
//         const offset = (page - 1) * limit;
//         const query = 'SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1 LIMIT $2 OFFSET $3';
//         const values = [`%${search}%`, limit, offset];
//         const result = await pool.query(query, values);
//         const countQuery = 'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1';
//         const countResult = await pool.query(countQuery, [`%${search}%`]);
//         return {
//             students: result.rows,
//             total: parseInt(countResult.rows[0].count),
//             page: parseInt(page),
//             limit: parseInt(limit)
//         };
//     }

//     static async findByEmail(email){
//         const query = 'SELECT * FROM users WHERE email = $1';
//         const result = await pool.query(query, [email]);
//         return result.rows[0];
//     }

//     static async findById(id){
//         const query = "SELECT * FROM users WHERE id=$1";
//         const result = await pool.query(query, [id]);
//         return result.rows[0];
//     }


//     static async update(id, name, email, password, role){
//         try{
//             const userId = parseInt(id, 10);
//         if (isNaN(userId) || userId <= 0) {
//             throw new Error('Invalid user ID');
//         }

//         const query = 'UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email), password = COALESCE($4, grade), role = COALESCE($5, role) WHERE id = $1 RETURNING *';
//         const values = [userId, name, email, password, role];
//         console.log('Executing update query:', query, 'with values:', values);
//         const result = await pool.query(query, values);
//         return result.rows[0];

//         }catch(error){
//             console.error('Error in User.update:', error.message);
//         if (error.code === '23505') {
//             throw new Error('A user with this email already exists');
//         }
//         throw new Error('Failed to update user');
//         }
//     }


//     static async delete(id) {
//         const query = 'DELETE FROM users WHERE id=$1';
//         await pool.query(query, [id]);
//     }
// }


// module.exports = User;



const { pool } = require('../config/db');

class User {
  static async create(name, email, password, role, is_verified = false) {
    try {
      const query = 'INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const values = [name, email, password, role, is_verified];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in User.create:', error.message);
      if (error.code === '23505') {
        throw new Error('A user with this email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  static async findAll(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = `%${search}%`;
      const query = `
        SELECT id, name, email, role 
        FROM users 
        WHERE name ILIKE $1 OR email ILIKE $1 
        ORDER BY id 
        LIMIT $2 OFFSET $3
      `;
      const countQuery = `
        SELECT COUNT(*) 
        FROM users 
        WHERE name ILIKE $1 OR email ILIKE $1
      `;
      const values = [searchQuery, limit, offset];

      const countResult = await pool.query(countQuery, [searchQuery]);
      const result = await pool.query(query, values);

      return {
        users: result.rows,
        totalItems: parseInt(countResult.rows[0].count),
        currentPage: parseInt(page),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in User.findAll:', error.message);
      throw new Error('Failed to fetch users');
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in User.findByEmail:', error.message);
      throw new Error('Failed to find user by email');
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in User.findById:', error.message);
      throw new Error('Failed to find user by ID');
    }
  }

  static async update(id, updates) {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
      }

      const { name, email, password, role } = updates;
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (name) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (email) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(email);
      }
      if (password) {
        updateFields.push(`password = $${paramIndex++}`);
        values.push(password);
      }
      if (role) {
        updateFields.push(`role = $${paramIndex++}`);
        values.push(role);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(userId);
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, name, email, role
      `;
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in User.update:', error.message);
      if (error.code === '23505') {
        throw new Error('A user with this email already exists');
      }
      throw new Error(error.message || 'Failed to update user');
    }
  }

  static async delete(id) {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
      }

      const query = 'DELETE FROM users WHERE id = $1';
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error in User.delete:', error.message);
      throw new Error('Failed to delete user');
    }
  }

  static async hasAdmin() {
    try {
      const query = 'SELECT COUNT(*) FROM users WHERE role = $1';
      const result = await pool.query(query, ['admin']);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error in User.hasAdmin:', error.message);
      throw new Error('Failed to check admin existence');
    }
  }
}

module.exports = User;