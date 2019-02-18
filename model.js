
//everything above this commment needs to go elsewhere
var mongoose = require('mongoose')

var {Schema} = mongoose


var userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    }, 
    lastName: {
        type: String,
        required: true
    }, 
    emailAddress: {
        type: String,
        required: true
    },  
    password: {
        type: String,
        required: true
    } 
});



var CourseSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //FOR some reason this is not showing up on any courses created using the 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    estimatedTime: {
        type: String
    },
    materialsNeeded: {
        type: String
    }
});

var User = mongoose.model('User', userSchema);
var Course = mongoose.model('Course', CourseSchema);

module.exports = {Course, User};