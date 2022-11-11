import {Users} from "../models";
import jwt from "jsonwebtoken";
import HttpError from "http-errors";
import _ from "lodash";
import moment from "moment";

const {JWT_SECRET} = process.env;

class UserController {

    static register = async (req, res, next) => {
        try {
            const {firstName, lastName, email, password} = req.body;
            const errors = {};

            if (!firstName || firstName.length < 2) {
                errors.firstName = `Invalid name `;
            }
            if (!lastName || lastName.length < 2) {
                errors.lastName = `Invalid last name `;
            }
            if (!email || email.length < 6) {
                errors.email = `Invalid email `;
            }
            if (!password || password.length < 3) {
                errors.password = `Bad password`;
            }

            const existsUser = await Users.findOne({
                where: {email}
            });

            if (existsUser) {
                errors.email = `Email Already registered `;
            }

            if (!_.isEmpty(errors)) {
                throw HttpError(403, {errors});
            }

            const user = await Users.create({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                status: 'active',
                lastVisit: moment(),
            });

            res.json({
                status: 'ok',
                user
            });
        } catch (e) {
            next(e)
        }
    }

    static login = async (req, res, next) => {
        try {
            const {email, password} = req.body;

            const user = await Users.findOne({
                where: {email},
            });

            if (!user || user.getDataValue('password') !== Users.passwordHash(password)) {
                throw HttpError(403);
            }

            const token = jwt.sign({userId: user.id}, JWT_SECRET);

            res.json({
                status: 'ok',
                token,
                user
            });
        } catch (e) {
            next(e)
        }
    }

    static list = async (req, res, next) => {
        try {
            const {search} = req.query;
            const where = {
                status: 'active',
            };

            if (search) {
                where.$or = [{
                    firstName: {
                        $like: `%${search}%`
                    }
                }, {
                    lastName: {
                        $like: `%${search}%`
                    }
                }]
            }

            const users = await Users.findAll({
                where,
            })

            res.json({
                status: 'ok',
                users
            });
        } catch (e) {
            next(e);
        }
    };

    static single = async (req, res, next) => {
        try {
            const {id} = req.query;

            if (!id) {
                throw HttpError(404);
            }

            const user = await Users.findOne({
                where: {id}
            });

            res.json({
                status: 'ok',
                user
            });
        } catch (e) {
            next(e);
        }
    };

}

export default UserController
