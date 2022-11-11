import express from "express";
import UserController from "../controllers/UserController";

const router = express.Router();

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/list', UserController.list);

router.get('/single', UserController.single);
export default router;