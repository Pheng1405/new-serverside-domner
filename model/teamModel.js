const mongoose = require('mongoose');

const teamModel = new mongoose.Schema({
    name:{
        type: String,
        require: [true, "Name must not be empty"]
    },
    description:{
        type: String,
        require:[true, "Description must not be empty"]
    },
    imageCover:{
        type: String,
        require: [true, "Image cover must not empty"]
    },
    position:{
        type: String,
        require: [true, "Position must be not empty"]
    },
    contact:{
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    }
},
);

const Team = mongoose.model("Team", teamModel);
module.exports = Team;