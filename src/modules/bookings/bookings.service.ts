import { pool } from "../../config/db";

export interface CreateBookingDTO {
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

const createBooking = async (bookingData: CreateBookingDTO) => {
  const result = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [
      bookingData.userId,
      bookingData.vehicleId,
      bookingData.startDate,
      bookingData.endDate,
      bookingData.totalPrice,
    ]
  );
  return result.rows[0];
};

const getBookings = async () => {
  const result = await pool.query(`SELECT * FROM bookings ORDER BY created_at DESC`);
  return result.rows;
};

const getBookingsByUserId = async (userId: number) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getBookingById = async (bookingId: number) => {
  const result = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
  return result.rows[0] || null;
};

const checkVehicleAvailability = async (
  vehicleId: number,
  startDate: string,
  endDate: string,
  excludeBookingId?: number
) => {
  const vehicleResult = await pool.query(
    `SELECT id, availability_status, daily_rent_price FROM vehicles WHERE id = $1`,
    [vehicleId]
  );

  if (vehicleResult.rows.length === 0) {
    return { available: false, vehicle: null, reason: "Vehicle not found" };
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status !== "available") {
    return { available: false, vehicle, reason: "Vehicle is not available" };
  }

  let query = `
    SELECT id FROM bookings 
    WHERE vehicle_id = $1 
    AND status = 'active'
    AND (
      (rent_start_date <= $2 AND rent_end_date >= $2) OR
      (rent_start_date <= $3 AND rent_end_date >= $3) OR
      (rent_start_date >= $2 AND rent_end_date <= $3)
    )
  `;
  const params: any[] = [vehicleId, startDate, endDate];

  if (excludeBookingId) {
    query += ` AND id != $4`;
    params.push(excludeBookingId);
  }

  const overlapResult = await pool.query(query, params);

  if (overlapResult.rows.length > 0) {
    return {
      available: false,
      vehicle,
      reason: "Vehicle is already booked for the selected dates",
    };
  }

  return { available: true, vehicle, reason: null };
};

const updateBooking = async (bookingId: number, data: Partial<any>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || value === undefined) continue;
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  if (fields.length === 0) {
    const existing = await getBookingById(bookingId);
    return existing;
  }

  fields.push(`updated_at = NOW()`);

  const query = `UPDATE bookings SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
  values.push(bookingId);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getExpiredBookings = async () => {
  const result = await pool.query(
    `SELECT * FROM bookings 
     WHERE status = 'active' 
     AND rent_end_date < CURRENT_DATE`
  );
  return result.rows;
};

export {
  createBooking,
  getBookings,
  getBookingsByUserId,
  getBookingById,
  checkVehicleAvailability,
  updateBooking,
  getExpiredBookings,
};
