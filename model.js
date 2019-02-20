var mongoose = require('mongoose'); //imports mongoose

var {Schema} = mongoose; // creates a new Schema

 //User schema is created. An _id is assigned at creation validation assigned with true
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
//courseSchema is created the user field will match an _id field from the userSchema to display the full user details
var CourseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
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



//creates the models
var User = mongoose.model('User', userSchema);
var Course = mongoose.model('Course', CourseSchema);
//models are exported
module.exports = {Course, User};