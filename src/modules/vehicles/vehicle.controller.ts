import { Request, Response } from "express";
import * as vehicleService from "./vehicle.service";

export const createVehicle = async (req: Request, res: Response) => {
     try {
          const vehicle = await vehicleService.createVehicle(req.body);
          res.status(201).json({
               success: true,
               message: "Vehicle created successfully",
               data: vehicle,
          });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
};

export const getVehicles = async (req: Request, res: Response) => {
     try {
          const vehicles = await vehicleService.getAllVehicles();
          res.status(200).json({ success: true, message: "Vehicles retrieved successfully", data: vehicles });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
};

export const getVehicle = async (req: Request, res: Response) => {
     try {
          const id = Number(req.params.id);
          if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
          const vehicle = await vehicleService.getVehicleById(id);
          if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
          res.status(200).json({ success: true, data: vehicle });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
};

export const updateVehicle = async (req: Request, res: Response) => {
     try {
          const id = Number(req.params.id);
          if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
          const updated = await vehicleService.updateVehicle(id, req.body);
          if (!updated) return res.status(404).json({ success: false, message: "Vehicle not found" });
          res.status(200).json({ success: true, data: updated });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
};

export const deleteVehicle = async (req: Request, res: Response) => {
     try {
          const id = Number(req.params.id);
          if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
          const deleted = await vehicleService.deleteVehicle(id);
          if (!deleted) return res.status(404).json({ success: false, message: "Vehicle not found" });
          res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
};

export default {
     createVehicle,
     getVehicles,
     getVehicle,
     updateVehicle,
     deleteVehicle,
};
