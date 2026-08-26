import express from "express";
import UsersCtrl from "./users.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(UsersCtrl.apiRegister);
router.route("/login").post(UsersCtrl.apiLogin);
router.route("/me").get(auth, UsersCtrl.apiGetMe);

export default router;
