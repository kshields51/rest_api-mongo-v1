'use strict'

//imports modules
var express = require("express");
var router = express.Router();
var Course = require("./model").Course; //importing Course model
var User = require("./model").User; //importing User model
var bcryptjs = require('bcryptjs'); //for hashing passwords
var auth = require('basic-auth'); //to read the auth headers

//if there is an id for a course, then the corresponding information is automatically saved to the req object as course
router.param("id", (req, res, next, id) => {
    Course.findById(req.params.id, (err, doc) => {
        if(err) return next(err);
        if(!doc) {
            err = new Error("Not Found");
            err.status = 404
            return next(err)
        }
        req.course = doc; //the course information is saved to req
        
        return next();
    }).populate('user'); //populate allows all the user inforation from the usserSchema to be shown
});

//Authentication
//This middleware ensures that a user is authenticated meaning that a username and password exists for them inside the db before they can take any actions like creating or editing a course
var authenticateUser = (req, res, next) => {
    var credentials = auth(req); //gets the user credentials from the req header
    var message = null; //placeholder for error message that restults from an error that happens within authenticateUser

    if (credentials) { //if the req header contains a username and a password
        var user = User.findOne({emailAddress: `${credentials.name}`}, (err, result) => { //The database will try to find a username and pwssword combo in the db
            if (err) next(err);
            if (result) {//if one exists it will be stored in a variable called authenticated
                var authenticated = bcryptjs.compareSync(credentials.pass, result.password); //the credentials from the header are compared with the username and password from the db
            
            if (authenticated) { //if they match
                req.currentUser = user; //the request object will have a currentUser property and the user is now authenticated
            } else{message = `Authentication failure for username: ${result.emailAddress}`};
        } else {message = `User not found for username: ${credentials.name}`};
    })} else{message = 'Auth header not found'};

    if (message) { //if authentication fails for any reason
        console.warn(message);
        res.status(401).json({ message: "Access Denied"});
    } else {
        next();
    };
};
    


// Courses ROUTES  //

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get("/courses",(req, res, next) => {
    Course.find({})
        .populate('user') //this populates the user field with the assocated user information as an object
        .exec((err, courses) => {
            if(err) return next(err);
            res.json(courses);
        });
});


// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get("/courses/:id", (req, res, next) => { //only one line is needed as all the work is done in the router.param above
    res.json(req.course);
});


// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post("/courses", authenticateUser, (req, res, next) => {
    var course = new Course(req.body); //creates a new instance of the course model
    course.save((err, course) => { //save function commits new course document to db
        if (err) { //error handler that sends err to global error handler
            if (err.name === 'ValidationError') { //if the req body did not have a title or a description
                err = new Error('Validation Error');
                err.status = 400;
                console.error("There was a validation Error");
                next(err);
            } else {return next(err)}
        } else { //if no errors the location header is set to the course that was just submitted
            //maybe something like user id = result_id
            res.set({'Location': `http://localhost:5000/api/courses/${course._id}`});
            res.status(201);
        res.json();
        };
    });
});


// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put("/courses/:id", authenticateUser, (req, res, next) => {
    req.course.update(req.body, (err, result) => {
        if (!req.body.title || !req.body.description) { //if the request does not contain a title or a description property
            var err = new Error('Validation Error');
                err.status = 400;
                console.error("There was a validation Error");
                return next(err);
        } else { //if the minimum amount of information needed is present
            res.status(204);
            res.json()
        };
    });
});


// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete("/courses/:id", authenticateUser, (req, res, next) => {
    req.course.remove((err) => {
        if(err) return next(err);
        req.course.save((err, course) => {
            if(err) return next(err);
            res.status(204);
            res.json();
        });
    });
});

//Users here

// GET /api/users - returns the currently authenticated user
router.get("/users", authenticateUser, (req, res) => {
    var profile = auth(req);
    User.findOne({emailAddress: `${profile.name}`})
        .exec((err, users) => {
            if(err) return next(err);
            res.json(users);
        });
});

// POST /api/users - Creates a new user and injects the information into the db
router.post("/users", (req, res, next) => {
    var user = new User(req.body);
    if (user.password) {
        user.password = bcryptjs.hashSync(user.password); //this uses bcrypt to hash the uers password before it is committed to the db
    }
    user.save((err, user) => { //saves the user if firstName, lastName, emailAddress, or password is not submitted, then a validation error occurs
        if (err) { //if there is a validation error
            if (err.name === 'ValidationError') {
                err = new Error('Validation Error')
                err.status = 400;
                console.error("There was a validation Error")
                next(err)
            } else {return next(err)}
        } else { //sets the location header back to home
            res.set({'Location': 'http://localhost:5000/'})
            res.status(201);
            res.json();
        };
    });
});

module.exports = router;