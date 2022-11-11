import express from "express";
import messages from "./messages";
import users from "./users";

const router = express.Router();

router.use('/messages', messages);
router.use('/users', users);

export default router;