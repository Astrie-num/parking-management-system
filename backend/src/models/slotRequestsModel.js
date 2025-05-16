const { pool } = require('../config/db');


class SlotRequest{
    static async create(user_id, vehicle_id, slot_id, request_status, requested_at, approved_at, slot_number){
        try{
            const query = ('INSERT INTO slots (user_id, vehicle_id, slot_id, request_status, requested_at, approved_at, slot_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *');
            const values = [user_id, vehicle_id, slot_id, request_status, requested_at, approved_at, slot_number];
            const result = await pool.query(query, values);
            return result.rows[0];
        }catch(error){
            console.error('Error in SlotRequest.create:', error.message);
            if(error.code === '23505'){
                throw new Error('A slot request with this slot number already exists');
            }

            throw new Error('Failed to create slot');
        }
            
    }

    static async findAll(page=1,  limit=5, search='') {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM slot_requests WHERE id ILIKE $1 OR slot_number ILIKE $1 LIMIT $2 OFFSET $3';
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);
        const countQuery = 'SELECT COUNT(*) FROM slot_requests WHERE id ILIKE $1';
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        return {
            slot_requests: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    static async findBySlotNumber(slot_number){
        const query = 'SELECT * FROM slot_requests WHERE slot_number = $1';
        const result = await pool.query(query, [slot_number]);
        return result.rows[0];
    }

    static async findById(id){
        const query = "SELECT * FROM slot_requests WHERE id=$1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }


    // static async update(id, slot_number, size, vehicle_type, status, location){
    //     try{
    //         const slotId = parseInt(id, 10);
    //     if (isNaN(slotId) || slotId <= 0) {
    //         throw new Error('Invalid slot ID');
    //     }

    //     const query = 'UPDATE slot_requests SET slot_number = COALESCE($2, slot_number)WHERE id = $1 RETURNING *';
    //     const values = [slotId, slot_number, size, vehicle_type, status, location];
    //     console.log('Executing update query:', query, 'with values:', values);
    //     const result = await pool.query(query, values);
    //     return result.rows[0];

    //     }catch(error){
    //         console.error('Error in SlotRequests.update:', error.message);
    //     if (error.code === '23505') {
    //         throw new Error('A slot request with this slot number already exists');
    //     }
    //     throw new Error('Failed to update slot');
    //     }
    // }


    static async delete(id) {
        const query = 'DELETE FROM slot_requests WHERE id=$1';
        await pool.query(query, [id]);
    }
}

module.exports = SlotRequest;







