var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
 var symptomSchema = new Schema({
     timestamp: {
         type: string,
         unique: true,
         required: true
     },
     hour:
     {
         type: number,
         required: true
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
    symptom:
    {
        type: string,
        required: true
    }
 })
 
 module.exports = mongoose.model('Symptom', symptomSchema);