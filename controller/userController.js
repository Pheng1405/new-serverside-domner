const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {cloudinary} = require("./../utils/cloudinary");
const authController = require("./authController");
const signToken = id =>  jwt.sign({id}, process.env.TOKEN_SECRET, {expiresIn : process.env.TOKEN_LIFE});


exports.getUserById = async (req, res) =>{
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        res.status(200).json({
            data : user
        });
    }
    catch(err){
        res.status(400).json({
            data : `Couldn't find users id = ${id}`
        });
    }
}

exports.getAllUser = async (req, res) =>{
    try{
        const users = await User.find({});
        res.status(200).json({
            data:users
        });
    }
    catch(err){
        res.status(400).json({
            message : err
        });
    }
}

exports.updateProfile = async (req, res) =>{
    const {profile, email} =  req.body;
    let userProfile = "";


    const user = await User.findOne({email});
    let token;
    //1. Getting token and check it's there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
    }
    // // console.log(token);
    if(!token){
        return res.status(498).json({
            status : "failed",
            message: "No Token"
        });
    }
    // //2. Verification Token
    let decode;
    let uid;
    try{
        decode =  jwt.verify(token, process.env.TOKEN_SECRET);
        uid = decode.id;
    }
    catch(err){
        return res.status(403).json({
            message : `You don't have permission`
        });
    }

    if(user._id != uid){
        return res.status(403).json({
            message : `You don't have permission to change other user profile`
        });
    }

    if(profile){
        userProfile = await cloudinary.uploader.upload(profile);
        userProfile = userProfile.secure_url;

        user.imageUrl = userProfile;
        await user.save();

        if(user){
            res.status(200).json({
                message : "User profile has been changed successfully",
                data : user
            });
        }
        else{
            res.status(400).json({
                message : "Cannot change user profile"
            });
        }
    }
    else{
        res.status(404).json({
            message: "Please provide new profile"
        });
    }
}