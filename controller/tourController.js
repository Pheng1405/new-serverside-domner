const Tour = require("../model/tourModel");
const {uploadImage} = require("../utils/uploadImage");

exports.createTour = async (req, res, next) =>{

    if(!req.body.user)  req.body.user = req.user._id;
    let {name, description, location, imageCover, images, user, price} = req.body;

    const tourImage = [];
    if(!name || !description || !location || !imageCover || !images){
        return res.status(400).json({
            status : "error",
            message: "Please provide all requried information"
        });
    }
    
    try{
        // Cover Image
        imageCover = await uploadImage(imageCover);
        // console.log(imageCover);

        // Province Image
        if(Array.isArray(images)){
            //  images.map(async(e) =>{
            //     imgLink = await uploadImage(e);
            //     provinceImages.push(imgLink);
            // });

            for(let i = 0 ; i<images.length ; i++){
                imgLink = await uploadImage(images[i]);
                tourImage.push(imgLink);
            }

            
        }
        else if(images){
            images = await uploadImage(images);   
        }
        else{
            tourImage = [];
        }


        
    }
    catch(error){
        return res.status(400).json({
            error : true,
            message: "Cannot upload image"
        });
    }
    finally{
        const newTour = await Tour.create({
            name,
            description,
            location,
            imageCover,
            images : tourImage,
            admin: user,
            price,
        });
        if(newTour){
            res.status(200).json({
                message : "Success",
                data:  newTour
            });
        }
        else{
            res.status(500).json({
                message : "Fail",
                data: newTour
            });
        }
    }



}

exports.getAllTour =async (req, res) =>{
    const tours = await Tour.find({});
    
    if(tours) res.status(200).json({data: tours});
    else      res.status(200).json({message: "No tour to display"});
}

exports.getOneTour =  async (req, res) =>{
    let id = req.params.id;
    try{
        const tour = await Tour.findById(id);
        return res.status(200).json({data: tour});
    }
    catch(error){
        return res.status(404).json({message : `Cannot found tour id = ${id}`});
    }
}

exports.updateOneTour = async(req, res)=>{
    let id = req.params.id;
    let {name, description, location, imageCover, images, user} = req.body;

    const tourImage = [];
    if(!name || !description || !location || !imageCover || !images){
        return res.status(400).json({
            status : "error",
            message: "Please provide all requried information"
        });
    }
    let tour;

    try{
        tour = await Tour.findById(id);
    }
    catch(error){
        return res.status(404).json({mesage: `Cannot found tour id = ${id}`});
    }

    try{
        // Cover Image
        imageCover = await uploadImage(imageCover);
        // console.log(imageCover);

        // Province Image
        if(Array.isArray(images)){
            // Push image to tourImage Array
            for(let i = 0 ; i<images.length ; i++){
                imgLink = await uploadImage(images[i]);
                tourImage.push(imgLink);
            }           
        }
        else if(images){
            images = await uploadImage(images);   
        }
        else{
            tourImage = [];
        }
    }
    catch(error){
        return res.status(400).json({
            error : true,
            message: "Cannot upload image"
        });
    }
    finally{
        tour.name = name;
        tour.description = description;
        tour.location = location;
        tour.imageCover = imageCover;
        tour.images = tourImage
        tour.admin = user;


        await tour.save();

        
        if(tour){
            res.status(200).json({
                message : "Success",
                data:  tour
            });
        }
        else{
            res.status(500).json({
                message : "Fail, Couldn't update tour",
            });
        }
    }

}

exports.deleteOneTour = async (req, res) =>{
    const id = req.params.id;

    try{
        const tour = await Tour.findByIdAndRemove(id);
        return res.status(200).json({
            status: 'success',
            message: "Tour has been delete successfully",
            data : tour
        });
    }
    catch(error){
        return res.status(404).json({mesage: `Cannot found tour id = ${id}`});
    }
}

exports.approveOneTour = async (req, res) =>{
    let id = req.params.id;

    let tour;

    try{
        tour = await Tour.findById(id);
    }
    catch(error){
        return res.status(404).json({mesage: `Cannot found tour id = ${id}`});
    }

    tour.status = "published";

    await tour.save();

    if(tour){
        res.status(200).json({
            message : "Success",
            data:  tour
        });
    }
    else{
        res.status(500).json({
            message : "Fail, Couldn't update tour",
        });
    }
}

exports.pendingTour = async (req, res) =>{
    try{
        const tours = await Tour.find({status : "pending"});
        if(Object.keys(tours).length > 0){
            res.status(200).json({data : tours});
        }
        else{
            res.status(404).json({message: "No pending tour"});
        }
    }
    catch(e){
        res.status(404).json({message: "No pending tour"});
    }
}

exports.publishedTour = async (req, res) =>{
    try{
        const tours = await Tour.find({status : "published"});
        if(tours !== null){
            res.status(200).json({data : tours});
        }
        else{
            res.status(404).json({message: "No published tour"});
        }
    }
    catch(e){
        res.status(404).json({message: "No published tour"});
    }
}
