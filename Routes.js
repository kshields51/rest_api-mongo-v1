'use strict'

// TODO setup your api routes here

var express = require("express");
var router = express.Router();
var Course = require("./model").Course;
var User = require("./model").User;
var bcryptjs = require('bcryptjs');
var auth = require('basic-auth');

router.param("id", (req, res, next, id) => {
    Course.findById(req.params.id, (err, doc) => {
        if(err) return next(err);
        if(!doc) {
            err = new Error("Not Found");
            err.status = 404
            return next(err)
        }
        req.course = doc;
        return next();
    }).populate('user');
});

//Authentication

var authenticateUser = (req, res, next) => {
    var credentials = auth(req);
    var message = null;
    console.log(credentials)

    if (credentials) {
        var user = User.findOne({emailAddress: `${credentials.name}`}, (err, result) => {
            if (err) next(err)
            if (result) {
                console.log(result)
                console.log(credentials.pass)
                console.log(result.password)
                var authenticated = bcryptjs.compareSync(credentials.pass, result.password)
                console.log(authenticated)
            
            if (authenticated) {
                console.log('hello')
                req.currentUser = user;
            } else{message = `Authentication failure for username: ${result.emailAddress}`}
        } else {message = `User not found for username: ${credentials.name}`}
        if (message) {
            console.warn(message);
            res.status(401).json({ message: "Access Denied"})
        } else {
            next();
        }
    })} else{message = 'Auth header not found'}    
    }
    


// Courses ROUTES  //

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get("/courses",(req, res, next) => {
    Course.find({})
        .populate('user')
        .exec((err, courses) => {
            if(err) return next(err);
            res.json(courses);
        });
});


// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get("/courses/:id", (req, res, next) => {
    res.json(req.course)
});


// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post("/courses", authenticateUser, (req, res, next) => {
    var course = new Course(req.body);
    course.save((err, course) => {
        if (err) {
            if (err.name === 'ValidationError') {
                err = new Error('Validation Error')
                err.status = 400;
                console.error("There was a validation Error")
                next(err)
            } else {return next(err)}
        } else {
            res.set({'Location': `http://localhost:5000/api/courses/${course._id}`})
            res.status(201);
            
        res.json(course);
        }
    });
});


// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put("/courses/:id", authenticateUser, (req, res, next) => {
    req.course.update(req.body, (err, result) => {
        if(err) return next(err);
        res.status(204);
        res.json(result);
    });
});


// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete("/courses/:id", authenticateUser, (req, res, next) => {
    req.course.remove((err) => {
        if(err) return next(err);
        req.course.save((err, course) => {
            if(err) return next(err);
            res.json(course);
        });
    });
});

//Users here

router.get("/users", authenticateUser, (req, res) => {
    var profile = auth(req);
    User.findOne({emailAddress: `${profile.name}`})
        .exec((err, users) => {
            if(err) return next(err);
            res.json(users);
        });
});

router.post("/users", (req, res, next) => {
    var user = new User(req.body);
    if (user.password) {
        user.password = bcryptjs.hashSync(user.password);
    }
    user.save((err, user) => {
        if (err) {
            if (err.name === 'ValidationError') {
                err = new Error('Validation Error')
                err.status = 400;
                console.error("There was a validation Error")
                next(err)
            } else {return next(err)}
        } else {
            res.set({'Location': 'http://localhost:5000/'})
            res.status(201);
            res.json();
        } 
    });
});

module.exports = router;