import { Files, Messages, Users } from "../models";
import Socket from "../services/Socket";
import path from "path";
import { v4 as uuidV4 } from "uuid";
import fs from "fs";
import _ from 'lodash';

class MessagesController {
  static list = async (req, res, next) => {
    try {
      const { friendId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const { userId } = req;

      const messages = await Messages.findAll({
        where: {
          $or: [
            { from: userId, to: friendId },
            { from: friendId, to: userId },
          ]
        },
        include: [{
          model: Users,
          as: 'userFrom',
          required: true,
        }, {
          model: Users,
          as: 'userTo',
          required: true,
        }, {
          model: Files,
          as: 'files',
          required: false,
        }],
        order: [['createdAt', 'desc']],
        offset: (page - 1) * limit,
        limit: +limit
      });

      const total = await Messages.count({
        where: {
          $or: [
            { from: userId, to: friendId },
            { from: friendId, to: userId },
          ]
        },
      });

      res.json({
        status: 'ok',
        messages,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (e) {
      next(e);
    }
  };

  static send = async (req, res, next) => {
    try {
      const { friendId } = req.params;
      const { text, type = 'text' } = req.body;
      const { userId } = req;
      const { files } = req;

      const { id } = await Messages.create({
        from: userId,
        to: friendId,
        text,
        type,
      });

      if (!_.isEmpty(files)) {
        const filesData = files.map(file => {
          const fileName = file ? uuidV4() + '-' + file.originalname : '';
          const filePath = path.join('files', fileName);
          fs.renameSync(file.path, path.join(__dirname, '../public/', filePath))
          return {
            name: filePath,
            size: file.size,
            mimetype: file.mimetype,
            messageId: id,
            originalName: file.originalname
          }
        });
        await Files.bulkCreate(filesData);
      }

      const message = await Messages.findOne({
        where: { id },
        include: [{
          model: Users,
          as: 'userFrom'
        }, {
          model: Users,
          as: 'userTo'
        }, {
          model: Files,
          as: 'files'
        }],
      });

      // if (file && ['image/png', 'image/jpeg'].includes(file.mimetype)) {
      //   await Promise.all([
      //     sharp(file.path)
      //       .rotate()
      //       .resize(512)
      //       .toFile(path.join(__dirname, '../public/', filePath)),
      //
      //   ]);
      // } else if (file) {
      //   fs.renameSync(file.path, path.join(__dirname, '../public/', filePath))
      // }

      Socket.emitUser(friendId, 'new-message', { message });

      res.json({
        status: 'ok',
        message
      });
    } catch (e) {
      if (!_.isEmpty(req.file)) {
        fs.unlinkSync(req.file.path);
      }
      next(e);
    }
  };
}

export default MessagesController
