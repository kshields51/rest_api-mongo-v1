var authenticateUser = (req, res, next) => {
    console.log('hello')
    var credentials = auth(req);
    console.log(credentials)
    var message = null
    var authentication = users.find({}, (err, records) => {
        if (err) {
            return(err)
        }
        records.emailAddress.map(user => {
            if (credentials) {
            if(credentials.name === user) {
                var authenticated = bcryptjs.compareSync(credentials.pass, user.password)
            } else {message = `User not found for username: ${credentials.name}`} 
            
            if(authenticated) {
                console.log(`Authentication successful for username: ${user.username}`)
                req.currentUser = user;
                next();
            } else {message = `Authentication failure for username: ${user.username}`;}
        } else {message = 'Auth header not found'};
    });
    if (message) {
        console.warn(message);
        res.status(401).json({message: 'Access Denied'})
    } else {
        next();
    }
});

    
}