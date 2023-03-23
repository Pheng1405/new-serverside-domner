const Team = require("../model/teamModel");
const { uploadImage } = require("../utils/uploadImage");

exports.createTeam = async (req, res) =>{
    const{name, description, imageCover, position, contact} = req.body;
    if(!name || !description || !position) return res.status(400).json({error: true, message: "Please provide required information"});

    const profile = await uploadImage(imageCover);

    try{
        const team = await Team.create({
            name,
            description,
            imageCover: profile,
            position,
            contact
        });
        return res.status(201).json({
            status: "success",
            data: team
        });
    }
    catch(e){
        return res.status(400).json({
            status: "failed",
            message: e
        });
    }


}

exports.getTeam = async (req, res) =>{
    try{
        const team = await Team.find({});
        return res.status(200).json({
            status: "success",
            data: team
        });
    }   
    catch(e){
        return res.status(404).json({
            status: "failed",
            message : e
        });
    } 
}

exports.updateTeam = async (req, res) =>{
    const id = req.params.id;
    

    let team;
    try{
        team = await Team.findById(id);
    }
    catch(e){
        return res.status(404).json({
            status: "failed",
            message: `Team id = ${id} not found!`
        });
    }

    const{name, description, imageCover, position, contact} = req.body;
    
    if(!name || !description || !position) return res.status(400).json({error: true, message: "Please provide required information"});
    
    const profile = await uploadImage(imageCover);
    // team = {
    //     name : name,
    //     description: description,
    //     imageCover: profile,
    //     position: position,
    //     contact : contact
    // }
    team.name = name;
    team.description = description;
    team.imageCover = profile;
    team.position = position;
    team.contact = contact;
    try{
        await team.save();
        return res.status(200).json({
            message : "success",
            data: team
        });
    }
    catch(e){
        return res.status(404).json({
            status: "failed",
            message: e
        })
    }
}

exports.deleteTeam = async (req, res) =>{
    const id = req.params.id;
    
    try{
        const team = await Team.findByIdAndRemove(id);
        return res.status(200).json({
            status: "delete success",
            data: team
        })
    }
    catch(e){
        return res.status(404).json({
            status: "failed",
            message: e
        });
    }
}