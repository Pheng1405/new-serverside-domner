const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId
    },
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
    images:{
        type: [String],
        default: null
    },
    location:{
            type:{
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    }

});

const Province = mongoose.model("Province", provinceSchema);
module.exports = Province;