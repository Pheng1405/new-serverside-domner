const mongoose = require('mongoose');

const tourModel = new mongoose.Schema({
    name:{
        type: String,
        require: [true, "Name must not be empty"]
    },
    description:{
        type: String,
        require:[true, "Description must not be empty"]
    },
    provinceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
        default: null
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Tour must belong to an admin']
    },
    status:{
        type: String,
        default: "pending",
        enum: ["pending","published"]
    },
    imageCover:{
        type: String,
        require: [true, "Image cover must not empty"]
    },
    images:{
        type: [String],
        default: null
    },
    price:{
        type: Number,
        default: 0
    },
    location:[
        {
            type:{
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    }
},
);

const Tour = mongoose.model("Tour", tourModel);
module.exports = Tour;