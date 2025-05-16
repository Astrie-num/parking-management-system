const { pool } = require('../config/db');


class Vehicle{
    static async create(user_id, plate_number, vehicle_type, size, other_attributes){
        try{
            const query = ('INSERT INTO vehicles (user_id, plate_number, vehicle_type, size, other_attributes) VALUES ($1, $2, $3, $4, $5) RETURNING *');
            const values = [user_id, plate_number, vehicle_type, size, other_attributes];
            const result = await pool.query(query, values);
            return result.rows[0];
        }catch(error){
            console.error('Error in Vehicle.create:', error.message);
            if(error.code === '23505'){
                throw new Error('A vehicle with this plate number already exists');
            }

            throw new Error('Failed to create vehicle');
        }
            
    }

    static async findAll(page=1,  limit=5, search='') {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM vehicles WHERE user_id ILIKE $1 OR plate_number ILIKE $1 LIMIT $2 OFFSET $3';
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);
        const countQuery = 'SELECT COUNT(*) FROM vehicles WHERE user_id ILIKE $1 OR plate_number ILIKE $1';
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        return {
            vehicles: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    static async findByPlateNumber(plate_number){
        const query = 'SELECT * FROM vehicles WHERE plate_number = $1';
        const result = await pool.query(query, [plate_number]);
        return result.rows[0];
    }

    static async findById(id){
        const query = "SELECT * FROM vehicles WHERE id=$1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }


    static async update(id, plate_number, vehicle_type, size, other_attributes){
        try{
            const vehicleId = parseInt(id, 10);
        if (isNaN(vehicleId) || vehicleId <= 0) {
            throw new Error('Invalid vehicle ID');
        }

        const query = 'UPDATE vehicles SET plate_number = COALESCE($2, plate_number),  vehicle_type= COALESCE($3, vehicle_type), size = COALESCE($4, size), other_attributes = COALESCE($5, other_attributes) WHERE id = $1 RETURNING *';
        const values = [vehicleId, plate_number, vehicle_type, size, other_attributes];
        console.log('Executing update query:', query, 'with values:', values);
        const result = await pool.query(query, values);
        return result.rows[0];

        }catch(error){
            console.error('Error in Vehicle.update:', error.message);
        if (error.code === '23505') {
            throw new Error('A vehicle with this plate number already exists');
        }
        throw new Error('Failed to update vehicle');
        }
    }


    static async delete(id) {
        const query = 'DELETE FROM vehicles WHERE id=$1';
        await pool.query(query, [id]);
    }
}

module.exports = Vehicle;

