const Province = require("../model/provinceModel");
const {uploadImage} = require("../utils/uploadImage");

exports.createProvince = async (req, res) =>{

    let {name, description, location, imageCover, images} = req.body;
    var provinceImages = [];
    if(!name || !description || !location || !imageCover){
        res.status(400).json({
            status: "error",
            message: "Please provide all required fields"
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
                provinceImages.push(imgLink);
            }

            
        }
        else if(images){
            images = await uploadImage(images);   
        }
        else{
            provinceImages = [];
        }
        // console.log(provinceImages);

        
    }
    catch(error){
        return res.status(400).json({
            error : true,
            message: "Cannot upload image"
        });
    }
    finally{
        const newPronvince = await Province.create({
            name : name,
            description : description,
            location : location,
            imageCover: imageCover,
            images : provinceImages
        });
        if(newPronvince){
            res.status(200).json({
                message : "Success",
                data:  newPronvince
            });
        }
        else{
            res.status(500).json({
                message : "Fail",
                data: newPronvince
            });
        }
    }



    
}

exports.getAllProvince = async (req, res) =>{
    const search = req.query.search || "";
    const limit = Number(req.query.limit) || 10;
    const page  = req.query.page || 1;
    const startIndex = (page-1) * limit;
    const endIndex = (page) * Number(limit);
    const totalTour = await Province.find({name: { $regex: search, $options: "i"}}).countDocuments();
    const totalPage = Math.ceil(totalTour/limit);
    const pageItem  = [];
    for(let i =1 ; i<= totalPage ; i++){
        pageItem.push(i);
    }
    try{
        const Provinces = await Province.find({name: { $regex: search, $options: "i"}})
        .skip(startIndex)   
        .limit(limit);

        return res.status(200).json({
            status: "success",
            totalTour,
            totalPage,
            pageItem,
            data : Provinces
        });;
        
    }
    catch(e){
        return res.status(404).json({
            status : "failed",
            message : e
        });
    }
    

    
}

exports.getOneProvince = async (req, res) =>{
    const id = req.params.id;

    const province = await Province.findById(id);

    if(province){
        res.status(200).json({
            status : "success",
            
            data: province
        });
    }
    else{
        res.status(400).json({
            status: "fail",
            message: `Cannot found province by id = ${id}`
        });
    }
}

exports.deleteOneProvince = async(req, res)=>{
    const {id} = req.params;

    try{
        const province = await Province.findByIdAndRemove(id);
        res.status(200).json({message : `${province.name} province has been delete successful`})
    }
    catch(error){
        res.status(400).json({message : `Cannot delete province id = ${id}`});
    }   
}