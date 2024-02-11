// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat
import { Request, Response, NextFunction } from "express";
import { Cat, LoginUser, User } from "../../types/DBTypes";
import CatModel from "../models/catModel";
import { MessageResponse } from "../../types/MessageTypes";
import rectangleBounds from "../../utils/rectangleBounds";
import exp from "constants";

// - catGetByUser - get all cats by current user id
const catGetByUser = async (
    req: Request,
    res: Response<Cat[]>,
    next: NextFunction
) => { 
    try {
        const cats = await CatModel.find({ "owner._id": res.locals.user._id })
        .select("-__v")
        .populate({
            path: "owner",
            select: "-password -role -__v",
        });
        if (!cats) {
            res.status(404);
            console.log("No cats found!");
            return;
        }
        res.json(cats);        
    } catch(error) {
        next(error);
    }
};

// - catPutAdmin - only admin can change cat owner
const catPutAdmin = async (
    req: Request<{id:String}, {}, Omit<Cat, "_id">>,
    res: Response<MessageResponse>,
    next: NextFunction
    ) => {
        const cat = await CatModel.findById(req.params.id);
        if (!cat) {
            res.status(404);
            console.log("Cat not found");
            return;
        }
        let updateData: Partial<Cat> = {...req.body};
        if (res.locals.user.role !== "admin") {
            delete updateData.owner;
            try {
                await CatModel.findByIdAndUpdate(req.params.id, updateData, {new: true});
                res.json({message: "Cat updated but not owner"});
            } catch (error) {
                next(error);
            }
        }
        try {
            await CatModel.findByIdAndUpdate(req.params.id, updateData, {new: true});
            res.json({message: "Cat updated"});
        } catch (error) {
            next(error);
        }
    };

// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
    req: Request,
    res: Response<Cat[]>,
    next: NextFunction
) => {

};

// - catDeleteAdmin - only admin can delete cat
const catDeleteAdmin = async (
    req: Request<{id:String}>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
        res.status(404);
        console.log("Cat not found");
        return;
    }
    if (res.locals.user.role !== "admin") {
       res.json({message: "Only admin can delete cat"});
       return;
    }
    try {
        await CatModel.findByIdAndDelete(req.params.id);
        res.json({message: "Cat Deleted"});
    } catch (error) {
        next(error);
    }
};

// - catDelete - only owner can delete cat
const catDelete = async (
    req: Request<{id:String}>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
        res.status(404);
        console.log("Cat not found");
        return;
    }
    if (res.locals.user._id !== cat.owner._id) {
        res.json({message: "Only owner can delete cat"});
        return;
    }
    try {
        await CatModel.findByIdAndDelete(req.params.id);
        res.json({message: "Cat Deleted"});
    } catch (error) {
        next(error);
    }
};

// - catPut - only owner can update cat
const catPut = async (
    req: Request<{id:String}, {}, Omit<Cat, "_id">>,
    res: Response<MessageResponse>,
    next: NextFunction
) => {
    const cat = await CatModel.findById(req.params.id);
        if (!cat) {
            res.status(404);
            console.log("Cat not found");
            return;
        }
        if (res.locals.user._id !== cat.owner._id) {
            res.json({message: "Only owner can update cat"});
            return;
        }
        try {
            await CatModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
            res.json({message: "Cat updated"});
        } catch (error) {
            next(error);
        }
};

// - catGet - get cat by id
const catGet = async (
    req: Request<{id:String}>,
    res: Response<Cat>,
    next: NextFunction
) => {
    try {
        const cat = await CatModel.findById(req.params.id)
        .select("-__v")
        .populate({
            path: "owner",
            select: "-password -role -__v",
        });
        if (!cat) {
            res.status(404);
            console.log("Cat not found");
            return;
        }
        res.json(cat);
    } catch (error) {
        next(error);
    }
};

// - catListGet - get all cats
const catListGet = async (
    req: Request,
    res: Response<Cat[]>,
    next: NextFunction
) => {
    try {
        const cats = await CatModel.find()
        .select("-__v")
        .populate({
            path: "owner",
            select: "-password -role -__v",
        });
        if (!cats) {
            res.status(404);
            console.log("No cats found!");
            return;
        }
        res.json(cats);
    } catch (error) {
        next(error);
    }
};

// - catPost - create new cat
const catPost = async (
    req: Request<{}, {}, Cat>,
    res: Response,
    next: NextFunction
) => {
    try {
        const catInput = {
            cat_name: req.body.cat_name,
            weight: req.body.weight,
            filename: req.body.filename,
            birthdate: req.body.birthdate,
            location: req.body.location,
            owner: req.body.owner,
        };

        const cat = await CatModel.create(catInput);

        res.json({message: "Cat created", data: cat});
    } catch (error) {
        next(error);
    }
};

export {catListGet, catPost, catGet, catPut, catDelete, catDeleteAdmin, catGetByBoundingBox, catPutAdmin, catGetByUser};