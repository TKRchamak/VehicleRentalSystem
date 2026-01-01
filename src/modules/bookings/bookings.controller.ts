import { Request, Response } from "express";
import * as vehicleService from "../vehicles/vehicle.service";
import * as bookingService from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { vehicle_id, rent_start_date, rent_end_date, customer_id } = req.body;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message:
          "Bad Request: Missing required fields (vehicle_id, rent_start_date, rent_end_date)",
      });
    }

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const availabilityCheck = await bookingService.checkVehicleAvailability(
      vehicle_id,
      rent_start_date,
      rent_end_date
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.reason || "Vehicle is not available",
      });
    }

    const vehicle = availabilityCheck.vehicle;
    if (!vehicle || !vehicle.daily_rent_price) {
      return res.status(400).json({
        success: false,
        message: "Vehicle daily rental price not set",
      });
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalPrice = daysDiff * vehicle.daily_rent_price;

    const booking = await bookingService.createBooking({
      userId: customer_id,
      vehicleId: vehicle_id,
      startDate: rent_start_date,
      endDate: rent_end_date,
      totalPrice: totalPrice,
    });

    await vehicleService.updateVehicle(vehicle_id, { availability_status: "booked" });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    if (req.user?.role === "admin") {
      const bookings = await bookingService.getBookings();
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    const bookings = await bookingService.getBookingsByUserId(req.user.id);
    res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    if (!req.params.bookingId) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Booking ID is required",
      });
    }

    const bookingId = parseInt(req.params.bookingId);
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (userRole === "customer") {
      if (booking.customer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only cancel your own bookings",
        });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Booking is already cancelled",
        });
      }

      if (booking.status === "returned") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a returned booking",
        });
      }

      const startDate = new Date(booking.rent_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate <= today) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel booking: Start date has passed or is today",
        });
      }

      const updatedBooking = await bookingService.updateBooking(bookingId, { status: "cancelled" });

      await vehicleService.updateVehicle(booking.vehicle_id, { availability_status: "available" });

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: updatedBooking,
      });
    } else if (userRole === "admin") {
      const { status } = req.body;

      if (status && status !== "returned") {
        return res.status(400).json({
          success: false,
          message: "Admin can only mark bookings as 'returned'",
        });
      }

      if (booking.status === "returned") {
        return res.status(400).json({
          success: false,
          message: "Booking is already marked as returned",
        });
      }

      const updatedBooking = await bookingService.updateBooking(bookingId, { status: "returned" });

      await vehicleService.updateVehicle(booking.vehicle_id, { availability_status: "available" });

      return res.status(200).json({
        success: true,
        message: "Booking marked as returned successfully",
        data: updatedBooking,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const autoMarkReturnedBookings = async () => {
  try {
    const expiredBookings = await bookingService.getExpiredBookings();

    for (const booking of expiredBookings) {
      if (booking.status === "active") {
        await bookingService.updateBooking(booking.id, { status: "returned" });
        await vehicleService.updateVehicle(booking.vehicle_id, {
          availability_status: "available",
        });
      }
    }

    return expiredBookings.length;
  } catch (error) {
    console.error("Error auto-marking returned bookings:", error);
    throw error;
  }
};

export { createBooking, getBookings, updateBookingStatus, autoMarkReturnedBookings };
