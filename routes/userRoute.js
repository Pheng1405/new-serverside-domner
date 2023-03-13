const authController = require("../controller/authController");
const userController = require("../controller/userController");
const userRoute = (app) =>{
    const {getUserById, getAllUser} = require("../controller/userController");
    const {login, register, deleteUser} = require("../controller/authController");
    
    app.post("/api/user/register", register);

    
    app.post("/api/user/login", login);
    app.get("/api/user/:id", authController.protect, authController.restrictTo("superAdmin"), getUserById);
    app.get("/api/users", authController.protect, authController.restrictTo("superAdmin"), getAllUser);
    app.delete("/api/user/:id", authController.protect, authController.restrictTo("superAdmin"), deleteUser);

    app.post("/api/user/forgotpassword", authController.forgotPassword);
    app.patch("/api/user/resetpassword/:token", authController.resetPassword);
    app.put("/api/user/updateProfile",authController.protect, authController.restrictTo("superAdmin", "admin", "user"), userController.updateProfile);
}

module.exports = userRoute;