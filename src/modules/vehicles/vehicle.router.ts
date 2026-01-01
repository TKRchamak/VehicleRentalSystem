import { Router } from "express";
import * as vehicleController from "./vehicle.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("admin"), vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicle);
router.put("/:id", auth("admin"), vehicleController.updateVehicle);
router.delete("/:id", auth("admin"), vehicleController.deleteVehicle);

export const vehicleRoutes = router;

export default router;
