// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
import { Request, Response, NextFunction } from "express"
import { User, UserOutput } from "../../types/DBTypes"
import UserModel from "../models/userModel";
import { MessageResponse } from "../../types/MessageTypes";
import { userDeleteCat } from "../../../test/catFunctions";

const userGet = async (
    req: Request<{id: String}>,
    res: Response<UserOutput>,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }
        res.json(user as UserOutput);
    } catch (error) {
        next(error);
    }
}; 

const userListGet = async (
    req: Request,
    res: Response<UserOutput[]>,
    next: NextFunction
) => {
    try {
        const users = await UserModel.find();
        if (!users) {
            res.status(404);
            console.log("No users found!");
            return;
        }
        res.json(users);
    } catch (error) {
        next(error);
    }
};

