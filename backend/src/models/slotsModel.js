// const { pool } = require('../config/db');

// class Slot {
//   static async create({ slot_number, floor, vehicle_type }) {
//     try {
//       const query = `
//         INSERT INTO slots (slot_number, floor, vehicle_type)
//         VALUES ($1, $2, $3)
//         RETURNING id, slot_number, floor, vehicle_type, status, created_at;
//       `;
//       const result = await pool.query(query, [slot_number, floor, vehicle_type]);
//       return result.rows[0];
//     } catch (error) {
//       console.error('Error creating slot:', error.message);
//       throw new Error('Failed to create slot');
//     }
//   }

//   static async getAvailableSlots({ vehicle_type, floor, page = 1, limit = 10 }) {
//     try {
//       const offset = (page - 1) * limit;
//       let query = `
//         SELECT id, slot_number, floor, vehicle_type, status
//         FROM slots
//         WHERE status = 'available'
//       `;
//       let countQuery = `
//         SELECT COUNT(*)
//         FROM slots
//         WHERE status = 'available'
//       `;
//       const params = [];
//       const countParams = [];
//       let paramIndex = 1;
//       let countParamIndex = 1;

//       if (vehicle_type && vehicle_type.trim() !== '') {
//         query += ` AND LOWER(vehicle_type) = LOWER($${paramIndex++})`;
//         countQuery += ` AND LOWER(vehicle_type) = LOWER($${countParamIndex++})`;
//         params.push(vehicle_type.toLowerCase());
//         countParams.push(vehicle_type.toLowerCase());
//       }
//       if (floor !== undefined && floor !== '') {
//         query += ` AND floor = $${paramIndex++}`;
//         countQuery += ` AND floor = $${countParamIndex++}`;
//         params.push(parseInt(floor, 10));
//         countParams.push(parseInt(floor, 10));
//       }

//       query += ` ORDER BY floor, slot_number LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
//       params.push(limit, offset);

//       // console.log('Count Query:', countQuery, 'Count Params:', countParams);
//       const countResult = await pool.query(countQuery, countParams);
//       const totalItems = parseInt(countResult.rows[0].count);

//       // console.log('Main Query:', query, 'Params:', params);
//       const result = await pool.query(query, params);

//       return {
//         slots: result.rows,
//         meta: {
//           totalItems,
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalItems / limit),
//           limit: parseInt(limit),
//         },
//       };
//     } catch (error) {
//       console.error('Error fetching available slots:', error.message);
//       throw new Error('Failed to fetch available slots');
//     }
//   }
// }

// module.exports = Slot;



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
      // Validate and sanitize pagination inputs
      const sanitizedPage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
      const sanitizedLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
      const offset = (sanitizedPage - 1) * sanitizedLimit;
  
      let query = `
        SELECT id, slot_number, floor, vehicle_type, status
        FROM slots
        WHERE status = 'available'
      `;
      let countQuery = `
        SELECT COUNT(*)
        FROM slots
        WHERE status = 'available'
      `;
  
      const params = [];
      const countParams = [];
      let paramIndex = 1;
      let countParamIndex = 1;
  
      // Add vehicle_type filter if provided
      if (vehicle_type && typeof vehicle_type === 'string' && vehicle_type.trim() !== '') {
        query += ` AND LOWER(vehicle_type) = LOWER($${paramIndex++})`;
        countQuery += ` AND LOWER(vehicle_type) = LOWER($${countParamIndex++})`;
        const sanitizedType = vehicle_type.trim().toLowerCase();
        params.push(sanitizedType);
        countParams.push(sanitizedType);
      }
  
      // Add floor filter if provided and valid
      if (floor !== undefined && floor !== null && floor !== '' && !isNaN(floor)) {
        const floorNumber = Number(floor);
        query += ` AND floor = $${paramIndex++}`;
        countQuery += ` AND floor = $${countParamIndex++}`;
        params.push(floorNumber);
        countParams.push(floorNumber);
      }
  
      // Add ordering and pagination
      query += ` ORDER BY floor, slot_number LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(sanitizedLimit, offset);
  
      // Execute queries
      const countResult = await pool.query(countQuery, countParams);
      const totalItems = parseInt(countResult.rows[0].count, 10);
  
      // Uncomment the next line for development/debugging
      // console.log('Query:', query, 'Params:', params);
  
      const result = await pool.query(query, params);
  
      return {
        slots: result.rows,
        meta: {
          totalItems,
          currentPage: sanitizedPage,
          totalPages: Math.ceil(totalItems / sanitizedLimit),
          limit: sanitizedLimit,
        },
      };
    } catch (error) {
      console.error('Error fetching available slots:', error.message);
      throw new Error('Failed to fetch available slots');
    }
  }
}  

module.exports = Slot;