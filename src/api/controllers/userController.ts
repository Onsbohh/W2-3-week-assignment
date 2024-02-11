// TODO: create the following functions:

import { Request, Response, NextFunction } from "express"
import { LoginUser, User, UserOutput } from "../../types/DBTypes"
import UserModel from "../models/userModel";
import { MessageResponse } from "../../types/MessageTypes";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// - userGet - get user by id
const userGet = async (
    req: Request<{id:String}, {}, {}>,
    res: Response<UserOutput>,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(req.params.id).select("-password -__v -role");
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }

        const userOutput: UserOutput = {
            _id: user._id,
            user_name: user.user_name,
            email: user.email,
        };

        res.json(userOutput);
    } catch (error) {
        next(error);
    }
}; 

// - userListGet - get all users
const userListGet = async (
    req: Request,
    res: Response<UserOutput[]>,
    next: NextFunction
) => {
    try {
        const users = await UserModel.find().select("-password -__v -role");
        if (!users) {
            res.status(404);
            console.log("No users found!");
            return;
        }

        const usersOutput = users.map((user) => {   
            return {
                _id: user._id,
                user_name: user.user_name,
                email: user.email,
            };
        });

        res.json(usersOutput);
    } catch (error) {
        next(error);
    }
};

// - userPost - create new user. Remember to hash password
const userPost = async (
    req: Request<{}, {}, User>,
    res: Response,
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
        console.log(userInput);

        const user = await UserModel.create(userInput);

        const userOutput: UserOutput = {
            _id: user._id,
            user_name: user.user_name,
            email: user.email,
        };

        jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string);

        console.log(user);
        res.json({message: "User created!" , data: userOutput});
    } catch (error) {
        next(error);
    }
};

// - userPutCurrent - update current user
const userPutCurrent = async (
    req: Request<{}, {}, User>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(res.locals.user._id); 
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }
        user.set(req.body);
        await user.save();

        const userOutput: UserOutput = {
            _id: user._id,
            user_name: user.user_name,
            email: user.email,
        };

        res.json({message: "User created!" , data: userOutput});
    } catch (error) {
        next(error);
    }
};

// - userDeleteCurrent - delete current user
const userDeleteCurrent = async (   
    req: Request,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findById(res.locals.user._id);
        if (!user) {
            res.status(404);
            console.log("User not found");
            return;
        }
        await UserModel.findByIdAndDelete(res.locals.user._id);
        res.json({message: "User deleted!"});
    } catch (error) {
        next(error);
    }
};

// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query

const checkToken = (    
    req: Request,
    res: Response<UserOutput>,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401);
        console.log("No token found");
        return;
    }

    const userOutput: UserOutput = {
        _id: res.locals.user._id,
        user_name: res.locals.user.user_name,
        email: res.locals.user.email,
    };

    res.json(userOutput);
};

export {userGet, userListGet, userPost, userPutCurrent, userDeleteCurrent, checkToken};