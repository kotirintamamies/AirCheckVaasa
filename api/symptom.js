var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
 var symptomSchema = new Schema({
     timestamp: {
         type: String,
         unique: true,
         required: true
     },
     hour:
     {
         type: Number,
         required: true
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
    symptom:
    {
        type: String,
        required: true
    }
 })
 
 module.exports = mongoose.model('Symptom', symptomSchema);