require ('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// console.log(process.env.DB_HOST);

// console.log(typeof process.env.DB_PASSWORD); 

const initializeTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(100) NOT NULL,
       role VARCHAR(20) DEFAULT 'user',
       is_verified BOOLEAN DEFAULT FALSE
      )
    `);


    // Create vehicles table
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS vehicles (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users(id),
    //     plate_number VARCHAR(20) UNIQUE NOT NULL,
    //     vehicle_type VARCHAR(50) NOT NULL,
    //     size VARCHAR(20) NOT NULL,
    //     other_attributes JSONB
    //   )
    // `);

    // Create slots table
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS slots (
    //      id SERIAL PRIMARY KEY,
    //     slot_number VARCHAR(10) UNIQUE,
    //     size VARCHAR(20),
    //     vehicle_type VARCHAR(50),
    //     status VARCHAR(20) DEFAULT 'available',
    //     location VARCHAR(100)
    //   )
    // `);

    // Create slot_requests table
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS slot_requests (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users(id),
    //     vehicle_id INTEGER REFERENCES vehicles(id),
    //     slot_id INTEGER REFERENCES slots(id),
    //     request_status VARCHAR(20) DEFAULT 'pending',
    //     requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     approved_at TIMESTAMP,
    //     slot_number VARCHAR(10)
    //   )
    // `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
      id SERIAL PRIMARY KEY,
      slot_number VARCHAR(10) NOT NULL,
      vehicle_type VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_vehicle_type CHECK (vehicle_type IN ('car', 'bike', 'truck')),
      CONSTRAINT valid_status CHECK (status IN ('available', 'occupied', 'reserved')),
      CONSTRAINT unique_slot_per_floor UNIQUE (slot_number));
    `);


    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      slot_id INTEGER REFERENCES slots(id),
      vehicle_registration VARCHAR(20) NOT NULL,
      vehicle_type VARCHAR(20) NOT NULL,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_vehicle_type CHECK (vehicle_type IN ('car', 'bike', 'truck')),
      CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled')),
      CONSTRAINT valid_time CHECK (end_time > start_time));
  `);
    
    // create logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(100),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
      
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) REFERENCES users(email),
      otp_code VARCHAR(100),
      expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
      
    );


    console.log('Tables created successfully or already axist!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

initializeTables();
module.exports = { pool };

