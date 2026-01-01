import { Request, Response } from "express";
import * as userService from "./users.service";

const getUsers = async (req: Request, res: Response) => {
     try {
          const users = await userService.getUsers();
          res.status(201).json({
               success: true,
               message: "User List",
               data: users,
          });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
}

const updateUserInfo = async (req: Request, res: Response) => {
     try {
          const user = await userService.updateUserInfo(Number(req.params.userId), req.body);
          res.status(201).json({
               success: true,
               message: "User updated successfully",
               data: user,
          });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
}

const removeUser = async (req: Request, res: Response) => {
     try {
          const user = await userService.removeUser(Number(req.params.userId));
          res.status(201).json({
               success: true,
               message: "User deleted successfully"
          });
     } catch (error: any) {
          res.status(500).json({ success: false, message: error.message });
     }
}

export {
     getUsers,
     updateUserInfo,
     removeUser
}