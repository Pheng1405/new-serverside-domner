const User = require("../model/userModel");
const Tour = require("../model/tourModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const {cloudinary} = require("./../utils/cloudinary");


const signToken = id =>  jwt.sign({id}, process.env.TOKEN_SECRET, {expiresIn : process.env.TOKEN_LIFE});

const hashPassword = async password => {
    // Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}


exports.login = async (req, res, next) =>{
    const {email, password} = req.body;

    // check if user entered email & password
    if(!email || !password){
        return res.status(400).json({message : "Please Enter all required information"});
    }

    var user;
    try{
        user = await User.findOne({email}).select("+password");
        if(user === null){
            return res.status(401).json({message : "Please provide correct information"});            
        }
    }
    catch(e){
        return res.status(401).json({message : "Please provide correct information"});
    }
    // console.log(user);
    // check if user entered password match with database
    const verifyPassword = await bcrypt.compare(password, user.password);
    if(verifyPassword){
        const token = signToken(user._id);
        res.status(200).json({
            id  : user._id,
            username: user.username,
            email: user.email,
            token : token,
            isAdmin: user.isAdmin,
            message : "Login Successful"
        });
    }
    else{
        return res.status(401).json({ message: 'Invalid credentials' })
    }
}

// Register
exports.register = async (req, res) =>{
    const {username, password, email, role, profile} = req.body;

    //Check if user enter all required information or not 
    // if user provide not enough information do not let them register
    if(!username || !password || !email){
        res.status(400).json({message : "Please Enter all required information"});
    }

    // Check if user exist by email since email is unique
    // If user exist do not let them register
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        return res.status(400).json({ message: 'User already exists' })
    }

    let userProfile = "";
            
    if(profile){
        userProfile = await cloudinary.uploader.upload(profile);
        userProfile = userProfile.secure_url;
    }
    // Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);


    try{
        const newUser = await User.create({
            username,
            email,
            role,
            imageUrl : userProfile,
            password : hashedPassword
        });
        const token = signToken(newUser._id);
        res.status(201).json({
            status : "success",
            token : token,
            data:{
                data: newUser
            }
        });
    }
    catch(err){
        res.status(400).json({
            status : "failed",
            message: err
        });
    }
}

exports.deleteUser = async(req, res) =>{
    const {id} = req.params;

    const isDelete = await User.findByIdAndDelete(id);
    isDelete 
    ? 
        res.status(200).json({message : "User delete succecssful"})
    :
    res.status(400).json({message : "Fail to perform deletion"});
}

exports.protect = async(req, res, next) =>{

    let token;

    
    //1. Getting token and check it's there
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    // console.log(token);
    if(!token){
        return next(res.status(401).json({
            message : "You are not logged in! Please login first."
        }));
        // next();
    }
    
    //2. Verification Token
    let decode;
    try{
        decode =  jwt.verify(token, process.env.TOKEN_SECRET);
    }
    catch(err){
        return res.status(401).json({
            message : "You're not authorize, please log in first"
        });
    }

    
    //3. Check if user still exist
    // console.log(decode);
    let currentUser;
    if(decode){
        currentUser = await User.findById(decode.id);
    }
    
    if(!currentUser){
        res.status(401).json({
            message : "This user is no longer logged in"
        });
        req.user = null;
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;

   
    next();
}

exports.ownerOnly = async(req, res, next) =>{
    if(!req.body.user)  req.body.user = req.user._id;
    var id = req.params.id;

    try{
        const tour = await Tour.findById(id);
        // console.log(tour.admin);
        // console.log(req.body.user)
        if(tour.admin.equals(req.body.user)){
            // console.log("True");
            return next();
        }
        else{
            return next(res.status(404).json({message:  "You don't have permission to perform other's tour"})); 
        }
    }
    catch(error){
        // console.log("Hi Eroor");
        return next(res.status(404).json({mesage: `Cannot found tour id = ${id}`}));
    }

}

exports.restrictTo = (...roles) => {
    return (req, res , next)=>{

        // roles ["admin"]
        // console.log(req.user.role);
        if(!roles.includes(req.user.role)){
            return next(res.status(403).json({
                message : "You do not have permission to perform this action"
            }));
        }
        next();
    }
}

exports.forgotPassword = async(req, res, next) =>{
    //1 . Get User Based on POST Email
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(res.status(404).json({
            message : "There is no user with this email address"
        }));
    }
    //2. Generate the random token 
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});
    //3. Send it to user's email

    const resetURL = `${req.protocol}://${req.get('host')}/api/user/resetpassword/${resetToken}`;
    const message  = `Fogot yout password? Submit a PATCH request with your new password to: ${resetURL}.\n If you don't forget your password, please ignore this email`;

    try{
        await sendEmail({
            email : user.email,
            subject: "Your password reset token (Valid for 10min)",
            message
        });

        res.status(200).json({
            status : "Success",
            message : "Token sent to email"
        });
    }
    catch(err){
        user.passwordResetExpired = undefined;
        user.passwordResetToken = undefined;

        await user.save();

        return next(res.status(500).json({
            message : "Error Sending email, Try again later"
        }));
    }

    

}
exports.resetPassword = async(req, res, next) =>{
    
    //1.)) If token has not expired, and there is user, set the new password
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const user = await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpired: {$gt : Date.now()}
    });

    //2.)) If token has not expired, and there is user, set the new password
    if(!user){
        return next(res.status(400).json({
            message : "Token is invalid or has expired"
        }));
    }

    user.password = await hashPassword(req.body.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save();

}