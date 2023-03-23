const Tour = require("../model/tourModel");
const {uploadImage} = require("../utils/uploadImage");

exports.createTour = async (req, res, next) =>{

    if(!req.body.user)  req.body.user = req.user._id;
    let {name, description, provinceId, location, imageCover, images, user, price} = req.body;

    const tourImage = [];
    //ADD LOCATION LATer
    if(!name || !description || !imageCover || !images || !provinceId){
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
            provinceId,
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
    let page  = Number(req.query.page);
    const status = req.query.status || "published";
    // const status = "published";

    if(page == 0) page = 1;

    const sortType = req.query.sortType || "createAt";
    const sortData = req.query.sortData || -1;
    const limit = Number(req.query.limit) || 10;
    const province = req.query.province || "";

    const sort  = req.query.sort || "desc";
    const search  = req.query.search || "";
    const startIndex = (page-1) * limit;
    const endIndex = (page) * Number(limit);

    let totalTour;
    let totalPage;
    let pageItem;

    
    try{
        let tours;
        if(province != ""){
            totalTour = await Tour.find({name: { $regex: search, $options: "i"}, provinceId : [province], status : [status]}).countDocuments();
            totalPage = Math.ceil(totalTour/limit);
            pageItem  = [];
            for(let i =1 ; i<= totalPage ; i++){
                pageItem.push(i);
            }
            tours = await Tour.find(
                {name: { $regex: search, $options: "i"} , provinceId : [province], status : [status]}
            )
            .populate('provinceId')
            .sort({ [sortType]: sortData})
            .skip(startIndex)   
            .limit(limit);
        }
        else{
            totalTour = await Tour.find({name: { $regex: search, $options: "i"}, status : [status]}).countDocuments();
            totalPage = Math.ceil(totalTour/limit);
            pageItem  = [];
            for(let i =1 ; i<= totalPage ; i++){
                pageItem.push(i);
            }
            tours = await Tour.find(
                {name: { $regex: search, $options: "i"}, status : [status]}
            )
            .populate('provinceId')
            .sort({ [sortType]: sortData})
            .skip(startIndex)   
            .limit(limit);
        }

        
            return res.status(200).json({
                pageNumber : page,
                totalTour,
                totalPage,
                pageItem,
                status: "success",
                data : tours
        });
    }
                                
                                // }
    catch(error){
        return res.status(404).json({
            status : "failed",
            mesage : "Cannot get tour"
        });
    }
}
exports.getMyTour = async (req, res) =>{
    const id    = req.params.adminId;
    let page  = Number(req.query.page);
    if(page == 0) page = 1;
    
    const sortType = req.query.sortType || "createAt";
    const sortData = req.query.sortData || -1;
    const limit = Number(req.query.limit) || 4;
    const sort  = req.query.sort || "desc";
    const search  = req.query.search || "";
    const startIndex = (page-1) * limit;
    const endIndex = (page) * Number(limit);

    const totalTour = await Tour.find({admin: `${id}`}).countDocuments();
    const totalPage = Math.ceil(totalTour/limit);
    const pageItem  = [];
    for(let i =1 ; i<= totalPage ; i++){
        pageItem.push(i);
    }
    
    try{
        const tours = await Tour.find(
            {name: { $regex: search, $options: "i" }, admin: `${id}`}
        )
        .populate('provinceId')
        .sort({ [sortType]: sortData})
        .skip(startIndex)   
        .limit(limit);
            return res.status(200).json({
                totalTour,
                totalPage,
                pageItem,
                status: "success",
                data : tours
        });
    }
                                
                                // }
    catch(error){
        return res.status(404).json({
            status : "failed",
            mesage : "Cannot get tour"
        });
    }

}
exports.getOneTour =  async (req, res) =>{
    let id = req.params.id;
    try{
        const tour = await Tour.findById(id).populate('provinceId');
        return res.status(200).json({data: tour});
    }
    catch(error){
        return res.status(404).json({message : `Cannot found tour id = ${id}`});
    }
}

exports.updateOneTour = async(req, res)=>{
    let id = req.params.id;
    let {name, description, location, imageCover, images, user, provinceId} = req.body;

    const tourImage = [];

    let tour;

    try{
        tour = await Tour.findById(id);
    }
    catch(error){
        return res.status(404).json({mesage: `Cannot found tour id = ${id}`});
    }

    if(imageCover){
        try{
            imageCover = await uploadImage(imageCover);
        }
        catch(error){
            return res.status(400).json({
                error : true,
                message: "Cannot upload imageCover"
            });
        }
    }

    if(images){
        try{
        // Cover Image
        
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
    }
        

    if(provinceId)
        tour.provinceId = provinceId
    if(location)
        tour.location = location;
    if(description)
        tour.description = description;
    if(name)
        tour.name = name;
    if(imageCover)
        tour.imageCover = imageCover;
    if(tourImage.length)
        tour.images = tourImage
    
    tour.admin = user;

    await tour.save();

    
    if(tour){
        return res.status(200).json({
            message : "Success",
            data:  tour
        });
    }
    else{
        return res.status(500).json({
            message : "Fail, Couldn't update tour",
        });
    }
    

}

exports.deleteOneTour = async (req, res) =>{
    const id = req.params.id;

    try{
        const tour = await Tour.findByIdAndRemove(id);
        return res.status(204).json({
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

exports.declinedOneTour = async (req, res) =>{
    let id = req.params.id;

    let tour;

    try{
        tour = await Tour.findById(id);
    }
    catch(error){
        return res.status(404).json({mesage: `Cannot found tour id = ${id}`});
    }

    tour.status = "declined";

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
