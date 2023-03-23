const authController = require("../controller/authController");
const teamController = require("../controller/teamController");
const teamRoute = (app) =>{
    app.post("/api/team", authController.protect,authController.restrictTo("superAdmin"), teamController.createTeam);
    app.get("/api/team",  teamController.getTeam);
    app.delete("/api/team/:id", authController.protect, authController.restrictTo("superAdmin"), teamController.deleteTeam);
    app.put("/api/team/:id", authController.protect, authController.restrictTo("superAdmin"), teamController.updateTeam);
}
module.exports = teamRoute;