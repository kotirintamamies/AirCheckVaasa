var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var gridSchema = new Schema({
  timestamp: {
        type: String,
        unique: true,
        required: true
    },
    time: {
        hour: {
            type: Number,
            required: true
        },
        day: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    },
  dimensions: {
        lat: 
        {
            type: Number,
            required: true
        },
        lng:
        {
            type: Number,
            required: true
  }},
    data:
    {
        temperature: 
        {
            type: Number,
        },
        humidity: 
        {
            type: Number,
        },
        airpressure: 
        {
            type: Number,
        },
        airqualityscore:
        {
            type: Number
        },
        events:
        {
            type: Array
        },
        symptoms:
        {
            type: Array
        },
        measurements:
        {
            gas:
            {type: Array}
        }
    }
    
});
 
module.exports = mongoose.model('Grid', gridSchema);