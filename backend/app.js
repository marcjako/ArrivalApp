var express = require('express');
var app = express();
var Datastore = require('nedb');
var jwt = require('jsonwebtoken');

//key for jwt
var secretkey= require("./secretkey").key;

// ### Server Config
//use 3000 for localhost
//use 62000 on uberspace server
var port = process.env.PORT || 62000;

var allowCrossDomain = function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,jwt');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // intercept OPTIONS method
    if (req.method === 'OPTIONS' ) {
        res.send(200);
    }
    else {
        next();
    }
};

// ### NeDB connection
db = new Datastore({filename: './DB/users.db'});
db.loadDatabase(function (err) {
    if (err) {
        console.log("couldn't access DB")
    }
});

// ### Express Config
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// ### fix CORS Problem on localhost
app.use(allowCrossDomain);

// ### create jwt
/* ### remove on server!
app.get('/jwt', function (req, res) {
    var apijwt = jwt.sign("jwt4api", secretkey);
    console.log(apijwt);
    res.send(apijwt);
});*/

// ### only authorized access with jwt
/*app.use(function (req, res, next) {
    //var token = req.headers['x-access-token'];
    var token = req.body.jwt;
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, secretkey, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.jwtuser = decoded.user;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});*/

// ### ROUTES --------------------------------------------------------------------------

// POST new User
app.post('/newUser', function (req, res) {
    var doc = req.body;

    db.insert(doc, function (err, newDoc) {
        if (err) {
            console.log("error at DB insertion");
            res.status(500).send('something broke!');
        }
        else {
            console.log("Inserted new user in DB:");
            console.log(newDoc);
            console.log("\n");
            res.send("ok");
        }
    });
});

// GET location of user :id
app.get('/getLocation/:id', function (req, res) {
    var id = req.params.id;

    db.find({id: id}, function (err, docs) {
        if (err) {
            console.log("error at DB retrieval");
            res.status(500).send('something broke!');
        }
        else {
            var loc = docs[0].location;
            res.send(loc);
        }
    });
});

//GET one user by id
app.get('/getPushid/:id', function (req, res) {
    var id = req.params.id;

    db.find({id: id}, function (err, docs) {
        if (err) {
            console.log("error at DB retrieval");
            res.status(500).send('something broke!');
        }
        else {
            var pushid = docs[0].pushid;
            res.send(pushid);
        }
    });
});

//POST give user access
app.post('/giveAccess', function (req, res) {
    var fromID = req.body.fromID;
    var toID = req.body.toID;

    db.update({id: fromID}, {$set: {access: toID}}, function (err, doc) {
        if (err) {
            console.log("error at DB update");
            res.status(500).send('something broke!');
        }
        else {
            console.log(doc);
            res.send("ok");
        }
    });
});

//Check if user exists by userid
app.get('/checkUser/:id', function (req, res) {
    var id = req.params.id;

    db.findOne({id: id}, function (err, docs) {
        if (err) {
            console.log("error at DB retrieval");
            res.status(500).send('something broke!');
        }
        else {
            if (docs === null) {
                res.send({"userExists": false});
                console.log("User " + id + " not found")
            }
            else {
                res.send({"userExists": true});
                console.log("User " + id + " exists")
            }
        }
    });
});

// ### Startup
app.listen(port, function (err) {
    if (err) {
        console.error("express server failed: ", err);
    }

    console.log("express server started at :" + port);

});
//export express app for tests etc.
module.exports = app;