import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 }, // 60s
});

const UserToken = mongoose.model("UserToken", userTokenSchema);

export default UserToken;