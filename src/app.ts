import express, { Request, Response } from "express";
import connectDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.router";
import { vehicleRoutes } from "./modules/vehicles/vehicle.router";
import { userRouter } from "./modules/users/users.router";
import { bookingRouter } from "./modules/bookings/bookings.router";

const app = express();
app.use(express.json());

connectDB();

const appRouter = express.Router();
appRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is UP and running....🔥",
  });
});

app.use("/api/v1", appRouter);

appRouter.use("/auth", authRoutes);
appRouter.use("/vehicles", vehicleRoutes);
appRouter.use("/users", userRouter);
appRouter.use("/bookings", bookingRouter);

appRouter.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
