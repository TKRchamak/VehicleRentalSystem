import { pool } from "../../config/db";

export interface Vehicle {
     id?: number;
     vehicle_name: string;
     type: string;
     registration_number: string;
     daily_rent_price?: number | null;
     availability_status?: string;
     created_at?: string;
     updated_at?: string;
}

export const createVehicle = async (data: Vehicle) => {
     const {
          vehicle_name,
          type,
          registration_number,
          daily_rent_price = null,
          availability_status,
     } = data;

     const result = await pool.query(
          `INSERT INTO Vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
          [vehicle_name, type, registration_number, daily_rent_price, availability_status]
     );

     return result.rows[0];
};

export const getAllVehicles = async () => {
     const result = await pool.query(`SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM Vehicles ORDER BY id DESC`);
     return result.rows;
};

export const getVehicleById = async (id: number) => {
     const result = await pool.query(`SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM Vehicles WHERE id = $1`, [id]);
     return result.rows[0];
};

export const updateVehicle = async (id: number, data: Partial<Vehicle>) => {
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
          const existing = await getVehicleById(id);
          return existing;
     }

     // update updated_at timestamp
     fields.push(`updated_at = NOW()`);

     const query = `UPDATE Vehicles SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
     values.push(id);

     const result = await pool.query(query, values);
     return result.rows[0];
};

export const deleteVehicle = async (id: number) => {
     const result = await pool.query(`DELETE FROM Vehicles WHERE id = $1 RETURNING *`, [id]);
     return result.rows[0];
};

export default {
     createVehicle,
     getAllVehicles,
     getVehicleById,
     updateVehicle,
     deleteVehicle,
};
