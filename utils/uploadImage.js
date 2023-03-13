const { cloudinary } = require("../utils/cloudinary");
exports.uploadImage = async (e)  =>{
    const imageLink = await cloudinary.uploader.upload(e);
    return imageLink.secure_url;
}