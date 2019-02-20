var mongoose = require('mongoose') //imports mongoose

var {Schema} = mongoose // creates a new Schema

 //User schema is created. An _id is assigned at creation along with
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
//courseSchema is created
var CourseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' }, //FOR some reason this is not showing up on any courses created using the //there are a million users
    //how does it konw which user maybe need a presave hook or something similar to maybe req.user.id
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

CourseSchema.pre('save', function() {
    var thisisid = req.userId
    this.user = thisisid
    next();
});

//creates the models
var User = mongoose.model('User', userSchema);
var Course = mongoose.model('Course', CourseSchema);
//models are exported
module.exports = {Course, User};