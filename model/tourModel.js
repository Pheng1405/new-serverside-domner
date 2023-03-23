const mongoose = require('mongoose');

const tourModel = new mongoose.Schema({
    name:{
        type: String,
    },
    description:{
        type: String,
    },
    provinceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status:{
        type: String,
        default: "pending",
        enum: ["pending","declined","published"]
    },
    imageCover:{
        type: String,
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
    }
},
);

const Tour = mongoose.model("Tour", tourModel);
module.exports = Tour;