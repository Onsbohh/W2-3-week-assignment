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
import bcrypt from "bcryptjs"

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

const userPost = async (
    req: Request<{}, {}, User>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    try {
        const salt = bcrypt.genSaltSync(10);

        const userInput = {
            user_name: req.body.user_name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, salt),
            role: "user",
        };

        const user = await UserModel.create(userInput);
        console.log(user);
        res.status(201).json({message: "User created!"});
    } catch (error) {
        next(error);
    }
};

const userPutCurrent = async (
    req: Request<{id: String}, {}, Omit<User, "_id">>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }
        await UserModel.findByIdAndUpdate(req.params.id, req.body);
        res.json({message: "User updated!"});
    } catch (error) {
        next(error);
    }
};

const userDeleteCurrent = async (   
    req: Request<{id: String}>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }
        await UserModel.findByIdAndDelete(req.params.id);
        res.json({message: "User deleted!"});
    } catch (error) {
        next(error);
    }
};

const checkToken = (    
    req: Request,
    res: Response<UserOutput>,
    next: NextFunction
) => {
    res.json(res.locals.user);
};

export default {userGet, userListGet, userPost, userPutCurrent, userDeleteCurrent, checkToken}