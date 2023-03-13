const tourController = require("../controller/tourController");
const authController = require("../controller/authController");

const tourRoute = (app) =>{
    app.post("/api/tour",
                        authController.protect,
                        authController.restrictTo("admin"),
                        tourController.createTour);
    
    app.put("/api/tour/:id", 
                        authController.protect,
                        authController.ownerOnly,
                        authController.restrictTo("admin"),
                        tourController.updateOneTour
    );
    app.delete("/api/tour/:id",
                        authController.protect,
                        authController.ownerOnly,
                        authController.restrictTo("admin"),
                        tourController.deleteOneTour
    );

    app.put("/api/approveTour/:id",
                        authController.protect,
                        authController.restrictTo("superAdmin"),
                        tourController.approveOneTour
    );

    app.get("/api/tours", tourController.getAllTour);
    app.get("/api/tour/:id", tourController.getOneTour);

    app.get("/api/tours/pending",
                            authController.protect,
                            authController.restrictTo("superAdmin"),
                            tourController.pendingTour
    );
    app.get("/api/tours/published",
                            authController.protect,
                            authController.restrictTo("superAdmin"),
                            tourController.publishedTour                     
    );

}

module.exports = tourRoute;