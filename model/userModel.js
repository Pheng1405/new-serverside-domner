const cryto = require("crypto");
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId
    },
    email:{
        type : String,
        require: [true, "Email must not be empty"]
    },

    username:{
        type : String,
        required: [true, "Username must not be empty"],
        unique: true
    },
    password:{
        type : String,
        required: [true, "Password must not be empty"],
        minLength: 8,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpired: Date,
    imageUrl: {
        type: String,
        default: null,
    },
    role:{
        type : String,
        enum: ["user", "admin", "superAdmin"],
        default : "user"
    }
});



userSchema.methods.createPasswordResetToken = function(){
    const resetToken = cryto.randomBytes(32).toString("hex");
    this.passwordResetToken = cryto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpired = Date.now() + 10 * 60 * 1000;

    //console.log(resetToken, this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;