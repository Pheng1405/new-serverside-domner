const provinceController = require("../controller/provinceController");
const authController     = require("../controller/authController");


const provinceRoute = app =>{
    app.post("/api/province",
                            authController.protect ,
                            authController.restrictTo("superAdmin"),
                            provinceController.createProvince 
                            );

                            
    app.delete("/api/province/:id",
                            authController.protect ,
                            authController.restrictTo("superAdmin"),
                            provinceController.deleteOneProvince);
            

    app.get("/api/provinces", provinceController.getAllProvince);
    app.get("/api/province/:id", provinceController.getOneProvince);
}

module.exports = provinceRoute;