import { Router } from "express";
import auth from "../../middleware/auth";
import * as usersController from "./users.controller";

const router = Router();

router.get("/", auth("admin"), usersController.getUsers);
router.put("/:userId", auth("admin", "own"), usersController.updateUserInfo);
router.delete("/:userId", auth("admin"), usersController.removeUser);

export const userRouter = router;
