import { Router } from "express";
import auth from "../../middleware/auth";
import * as bookingController from "./bookings.controller";

const router = Router();

router.post("/", auth("admin", "customer"), bookingController.createBooking);
router.get("/", auth("admin", "customer"), bookingController.getBookings);
router.put("/:bookingId", auth("admin", "customer"), bookingController.updateBookingStatus);

export const bookingRouter = router;
