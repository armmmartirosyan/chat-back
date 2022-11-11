import express from "express";
import MessagesController from "../controllers/MessagesController";
import uploader from "../middlewares/fileUploader";

const router = express.Router();

router.get('/list/:friendId', MessagesController.list);

router.post('/send/:friendId', uploader.array('files[]', 10), MessagesController.send);

export default router;
