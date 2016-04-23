var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var gridSchema = new Schema({
  timestamp: {
        type: string,
        unique: true,
        required: true
    },
    time: {
        hour: {
            type: number,
            required: true
        },
        day: {
            type: number,
            required: true
        },
        month: {
            type: number,
            required: true
        },
        year: {
            type: number,
            required: true
        }
    },
  dimensions: {
        lat: 
        {
            type: number,
            required: true
        },
        lng:
        {
            type: number,
            required: true
  }},
    data:
    {
        temperature: 
        {
            type: number,
        },
        humidity: 
        {
            type: number,
        },
        airpressure: 
        {
            type: number,
        },
        airqualityscore:
        {
            type: number
        },
        events:
        {
            type: Array
        },
        symptoms:
        {
            type: Array
        }
    }
    
});
 
module.exports = mongoose.model('Grid', gridSchema);