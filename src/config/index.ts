import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  connectionString: process.env.CONNECTION_STRING,
  port: process.env.PORT || "3000",
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
