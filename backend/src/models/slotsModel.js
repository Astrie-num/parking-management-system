const { pool } = require('../config/db');


class Slot{
    static async create(slot_number, size, vehicle_type, status, location){
        try{
            const query = ('INSERT INTO slots (slot_number, size, vehicle_type, status, location) VALUES ($1, $2, $3, $4, $5) RETURNING *');
            const values = [slot_number, size, vehicle_type, status, location];
            const result = await pool.query(query, values);
            return result.rows[0];
        }catch(error){
            console.error('Error in Slot.create:', error.message);
            if(error.code === '23505'){
                throw new Error('A slot with this slot number already exists');
            }

            throw new Error('Failed to create slot');
        }
            
    }

    static async findAll(page=1,  limit=5, search='') {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM slots WHERE id ILIKE $1 LIMIT $2 OFFSET $3';
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);
        const countQuery = 'SELECT COUNT(*) FROM slots WHERE id ILIKE $1';
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        return {
            slots: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    static async findBySlotNumber(slot_number){
        const query = 'SELECT * FROM slots WHERE slot_number = $1';
        const result = await pool.query(query, [slot_number]);
        return result.rows[0];
    }

    static async findById(id){
        const query = "SELECT * FROM slots WHERE id=$1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }


    static async update(id, slot_number, size, vehicle_type, status, location){
        try{
            const slotId = parseInt(id, 10);
        if (isNaN(slotId) || slotId <= 0) {
            throw new Error('Invalid slot ID');
        }

        const query = 'UPDATE slots SET slot_number = COALESCE($2, slot_number),  vehicle_type= COALESCE($3, vehicle_type), size = COALESCE($4, size), location = COALESCE($5, location) WHERE id = $1 RETURNING *';
        const values = [slotId, slot_number, size, vehicle_type, status, location];
        console.log('Executing update query:', query, 'with values:', values);
        const result = await pool.query(query, values);
        return result.rows[0];

        }catch(error){
            console.error('Error in Slot.update:', error.message);
        if (error.code === '23505') {
            throw new Error('A slot with this slot number already exists');
        }
        throw new Error('Failed to update slot');
        }
    }


    static async delete(id) {
        const query = 'DELETE FROM slots WHERE id=$1';
        await pool.query(query, [id]);
    }
}

module.exports = Slot;



