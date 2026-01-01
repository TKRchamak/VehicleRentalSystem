import { Pool } from "pg";
import config from ".";

//DB
export const pool = new Pool({
  connectionString: `${config.connectionString}`,
});

const initDB = async () => {
  await pool.query(`
          CREATE TABLE IF NOT EXISTS Users(
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password TEXT NOT NULL ,
          phone VARCHAR(15) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'customer')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
      `);

  await pool.query(`
          CREATE TABLE IF NOT EXISTS Vehicles(
          id SERIAL PRIMARY KEY,
          vehicle_name VARCHAR(200) NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'car' CHECK (type IN ('car', 'bike', 'van', 'SUV')),
          registration_number TEXT UNIQUE NOT NULL,
          daily_rent_price INT CHECK (daily_rent_price > 0),
          availability_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'booked')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
      `);

  await pool.query(`
          CREATE TABLE IF NOT EXISTS Bookings(
          id SERIAL PRIMARY KEY,
          customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
          vehicle_id INT REFERENCES Vehicles(id) ON DELETE CASCADE,
          rent_start_date DATE NOT NULL,
          rent_end_date DATE CHECK (rent_end_date > rent_start_date),
          total_price INT CHECK (total_price > 0),
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'returned')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
     `);
};

const connectDB = async () => {
  try {
    await initDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default connectDB;
