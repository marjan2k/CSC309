var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var db = require('./db');
app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded());

//**************************** MONGODB INITIALIAZATION ***************************//
var USER = db.models.USER;
var ORG = db.models.ORG;
var EVENT = db.models.EVENT;
var PERM = db.models.PERM;
var ObjectId = db.ObjectId;

var server = http.createServer(app);

app.use(express.static(__dirname + '/'));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


//**************************** GOOGLE SIGN IN ***************************//
app.use(session({ secret: 'enlististhebest' }));
app.use(passport.initialize());
app.use(passport.session());
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;



// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    //console.log("Bleh");
    USER.findOne({id:id}, function(err, user) {
        done(err, user);
        //console.log(user);
        //console.log("Blah");
    });
});

passport.use(new GoogleStrategy({

    clientID        : '917419953739-eepc3iijt5ckel2dgtqktnonr0f8r795.apps.googleusercontent.com',
    clientSecret    : 'U1Uud33_jgr2YgNTBzm8vcMG',
    callbackURL     : 'http://localhost:3000/auth/google/callback'
},

function(token, refreshToken, profile, done) {

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {

        // try to find the user based on their google id
        USER.findOne({ 'id' : profile.id }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                // if a user is found, log them in
                console.log("user is found");
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                var newUser = new USER();
                console.log("New user");
                // set all of the relevant information
                newUser.id    = profile.id;
                if (profile.photos[0].value)
                newUser.img   = profile.photos[0].value;
                newUser.token = token;
                newUser.name  = profile.displayName;
                newUser.email = profile.emails[0].value; // pull the first email

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });

}));



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        next();
    
    // if they aren't redirect them to the home page
    //
    else{
    console.log("Stuck here");
    res.redirect('/');
    }
}



//***************************************** GET *************************//
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.get('/', function(req, res){
    res.render("main.ejs");
});

app.get('/authenticated', isLoggedIn, function(req, res) {
        //console.log(req.user);
        res.render('authenticated.ejs', {
            user : req.user // get the user out of session and pass to template
        });

});

app.get('/listing', isLoggedIn, function(req, res) {
        //console.log(req.user);
        res.render('listing.ejs', {
            user : req.user // get the user out of session and pass to template
        });

});

app.get('/organization', isLoggedIn, function(req, res) {
        //console.log(req.user);
     
        res.render('organization.ejs', {
            user : req.user // get the user out of session and pass to template
        });

});

app.get('/user', isLoggedIn, function(req, res) {
        //console.log(req.user);
      
        res.render('user.ejs', {
            user : req.user // get the user out of session and pass to template
        });

});

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback',
        passport.authenticate('google', {
        successRedirect : '/authenticated',
        failureRedirect : '/'
}));


//***************************************** SEARCH *************************//

app.get("/search/organization/:keyword",function (req,res) {
  var query = {$text: {$search: req.params.keyword, $language: 'en'}};
  var result = ORG.find(query);
  result.exec(function (err,results) {

    if(err) {
      console.log(err);
      res.end();
      return;
    }
    console.log(results);
    res.status(200).send(results);
  });
});

app.get("/search/user/:keyword",function (req,res) {
  var query = {$text: {$search: req.params.keyword, $language: 'en'}};
  var result = USER.find(query);
  result.exec(function (err,results) {
    if(err) {
      console.log(err);
      res.end();
      return;

    }
    console.log(results);
    res.status(200).send(results);
  });
});

app.get("/search/event/:keyword",function (req,res) {
  var query = {$text: {$search: req.params.keyword, $language: 'en'}};
  var result = EVENT.find(query);
  result.exec(function (err,results) {
    if(err) {
      console.log(err);
      res.end();
      return;
    }
    console.log(results);
    res.status(200).send(results);
  });
});
//***************************************** GET *************************//

//return all organizations
app.get('/organization/all',function(req,res){

    ORG.find({}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        //return duplicate results for now
        res.send(result);
    });


});


//---------------------------
app.get('/organization/:email',function(req, res){
    var org_name  = req.params.email;

    ORG.find({email: org_name}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        console.log(result);
        //return duplicate results for now
        res.send(result);
    });

});


//---- Get the event that an orgnization has
app.get('/organization/myevent/:email',function(req, res){
  if(req.params.email != undefined)
    var org_email  = req.params.email;

    ORG.findOne({email: org_email}, function(err, result) {
        if (err || result == null) {
            res.status(400).end("Can't find Organization");
            return console.error(err);
        }
        console.log(result);

        //find event with org_id that matches this organization
        EVENT.find({org_id: result._id},function(err,events){
            if(err){
              res.status(400).end();
              return console.error(err);
            }else{
              res.status(200).send(events);
              return
            }
        });

    });

});


//return all users
app.get('/user/all',function(req,res){

    USER.find({}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        //return duplicate results for now
        res.send(result);
    });


});

//---------------------------

app.get('/user/:name',function(req, res){
    var user_name  = req.params.name;

    USER.find({username: user_name}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        //return duplicate results for now
        res.send(result);
    });

});


//return all events
app.get('/event/all',function(req,res){

    EVENT.find({}, function(err, result) {
       if (err) {
            res.status(400).end();
            return console.error(err);
        }
        //return duplicate results for now
        res.send(result);
    });
});


//return all LIVE events
app.get('/event/live',function(req,res){

    EVENT.find({status:1}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        //return duplicate results for now
        res.send(result);
    });


});

//------------------------

app.get('/event/:name',function(req, res){
    var event_name  = req.params.name;

    EVENT.find({name: event_name}, function(err, result) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }
        console.log(result);
        //return duplicate results for now
        res.send(result);
    });

});

//***************************************** POST *************************//

//POST for organization
app.post('/organization',function(req, res) {
    var data = {};
    var user_id = null;
    //need the superuser who is creating the organization
    if(req.body && req.body.email !== 'undefined')
        data.email = req.body.email;

    if(req.body && req.body.organization !== 'undefined')
        data.organization = req.body.organization;

    if(req.body && req.body.type !== 'undefined')
        data.type = req.body.type;

    if(req.body && req.body.field !== 'undefined')
        data.field = req.body.field;

    if(req.body && req.body.website !== 'undefined')
        data.website = req.body.website;

    if(req.body && req.body.description !== 'undefined')
        data.description = req.body.description;

    if(req.body && req.body.address !== 'undefined')
        data.address = req.body.address;

    if(req.body && req.body.number !== 'undefined')
         data.number = req.body.number;

        //Find the user to update its boolean
        USER.findOne({email : data.email},function(err,user) {
            if(err || user == null){
              res.status(400).send("User not found");
              return console.error(err);
            }else {
              //update user to organization
              user.whoami = "Organization";
              //create organization and link it
              var org2 = new ORG(data);
              org2.save(function (err2, orgz) {
                if (err2) {
                  res.status(400).send("Couldn't create and organization");
                  return console.error(err2);
                }else{
                  user.organization_id = org2._id;
                  console.log(user);
                  user.save(function(err,usr){
                    if(err){
                      res.status(400).send("Couldn't save user data");
                      return console.error(err);
                    }else{
                      res.status(200).send(usr);
                    }
                  });
                }
              });

            }
        });
});


//POST for User
app.post('/user', function(req, res) {
    var data = {};

    console.log("User gets this"  + req.body.name);

    // not using first_name and last_name ??
   if(req.body && req.body.name !== 'undefined')
        data.name = req.body.name;

    if(req.body && req.body.username !== 'undefined')
        data.username = req.body.username;

    if(req.body && req.body.email !== 'undefined')
        data.email = req.body.email;

    if(req.body && req.body.password !== 'undefined')
        data.password = req.body.password;

    if(req.body && req.body.age !== 'undefined')
        data.age = req.body.age;

    if(req.body && req.body.birth_date !== 'undefined')
        data.birth_date = req.body.birth_date;

    if(req.body && req.body.interests !== 'undefined')
        data.interests = req.body.interests;

    if(req.body && req.body.skills !== 'undefined')
        data.skills = req.body.skills;

    if(req.body && req.body.activity !== 'undefined')
        data.activity = req.body.activity;

    if(req.body && req.body.groups !== 'undefined')
        data.groups = req.body.groups;

    if(req.body && req.body.number !== 'undefined')
        data.number = req.body.number;

    if(req.body && req.body.address !== 'undefined')
        data.address = req.body.address;

    var user = new USER(data);
    user.save(function (err, user_) {
      if (err) {
          res.status(400).end();
          return console.error(err);
      }
      res.status(200).send(user.name);
    });

});

/* ------------------------------------------------ */
//***************************************** PUT *************************//

// put for organization is just to update some fields

app.put('/organization',function(req, res) {

    var data = {};

    if(req.body && req.body.organization !== 'undefined')
        data.organization = req.body.organization;

    if(req.body && req.body.type !== 'undefined')
        data.type = req.body.type;

    if(req.body && req.body.field !== 'undefined')
        data.field = req.body.field;

    if(req.body && req.body.email !== 'undefined')
        data.email = req.body.email;

    if(req.body && req.body.website !== 'undefined')
        data.website = req.body.website;

    if(req.body && req.body.description !== 'undefined')
        data.description = req.body.description;

    if(req.body && req.body.number !== 'undefined')
         data.number = req.body.number;

    if(req.body && req.body.address !== 'undefined')
         data.address = req.body.address;

        var query = { email: data.email };
        ORG.findOneAndUpdate(query,data, function(err, success ) {
            if (err) {
                res.status(400).end();
                return console.error(err);
            }
            console.log("Put search result is " + success);
            res.status(200).send(success.organization);
        });
});


app.post('/event',function (req,res) {
  var data = {};
  var email = null;
  if(req.body){

    if( typeof req.body.email !== undefined)
      email = req.body.email;

    if( typeof req.body.event_name !== undefined)
      data.name = req.body.event_name;

    if( typeof req.body.organization !== undefined)
      data.organization = req.body.orgnization;

    if( typeof req.body.description !== undefined)
      data.description = req.body.description;

    if( typeof req.body.date !== undefined)
      data.date = req.body.date;

    if( typeof req.body.location !== undefined)
      data.location = req.body.location;

    if( typeof req.body.lookingFor !== undefined)
      data.lookingFor = req.body.lookingFor;

  if( typeof req.body.num_of_volunteers !== undefined)
      data.num_of_volunteers = req.body.num_of_volunteers;

      data.status = 1;
  }

  //create find the organization and save the event
  ORG.findOne({email: email},function (err,org) {
      if(err || org == null){
        res.status(400).send("Organization not found");
        console.log(err);
        return;
      }else {
        //create the event and save it
        var event = new EVENT(data);
        event.org_id = org._id;
        event.save(function(err,_event){
          if(err || _event == null){
            res.status(400).send("Organization not found");
            console.log(err);
          }else {
            res.status(201).send("Created event");
            console.log(_event);
          }
        });
      }
  });

});



// Event
app.put('/event',function(req, res) {

    var data = {};

    if(req.body && req.body.username !== 'undefined')
        data.description = req.body.description;

    if(req.body && req.body.date !== 'undefined')
        data.date = req.body.date;

    if(req.body && req.body.location !== 'undefined')
        data.location = req.body.location;

    if(req.body && req.body.lookingFor !== 'undefined')
        data.lookingFor = req.body.lookingFor;

    if(req.body && req.body.num_of_volunteers !== undefined)
        data.num_of_volunteers = req.body.num_of_volunteers;

    if(req.body && req.body.confirmed_volunteers !== undefined){
      console.log("Number of volunteers " + req.body.confirmed_volunteers );
        data.confirmed_volunteers = req.body.confirmed_volunteers;
      }

    if(req.body && req.body.status !== undefined)
        data.status = req.body.status;

    var event_name = req.body.name;
    var loc = req.body.location;
    var query = { name: event_name };
      EVENT.findOneAndUpdate(query, data, function(err, success ) {
          if (err) {
              res.status(400).end();
              return console.error(err);
          }
          console.log("Put search result is " + success);
          res.status("OK").end();
      });

});

//need to update attendee list
app.put('/event/addVolunteer',function (req,res) {
  var event_name = null;
  var volunteer = null;
  if(req.body){
      if(typeof req.body.event_name !== 'undefined'){
        event_name = req.body.event_name;
      }
      if(typeof req.body.email !== 'undefined'){
        volunteer = req.body.email;
      }
      console.log("Name " + event_name + " email " + volunteer);

      //check if event exists? then user? then add if  the exist
      USER.findOne({email: volunteer},function (err,user) {
        if(err || user == null){
          res.status(400).send("Invalid User");
          console.error(err);
          return;
        }else{
          //find the event
          console.log("Found the user" + user);
          EVENT.findOne({name: event_name},function (err2,event) {
              if(err2 || event == null){
                res.status(400).send("Invalid Event");
                console.error(err2);
                return;
              }else{
                console.log("Found the event " + event);
                if((typeof event.num_of_volunteers === 'undefined') || (typeof event.num_of_volunteers === 'undefined')|| event.num_of_volunteers >= event.confirmed_volunteers){
                  //check if the user already exist in the array
                  var found_user = event.volunteer_list.find(function (vol,index,array) {
                    return (user._id.equals(vol.u_id));
                  });
                  console.log("Search of array list is " + found_user);
                  if(typeof found_user === 'undefined' && found_user == null){
                    event.volunteer_list.push({u_id:user._id, apv:0});
                    event.save(function (err3,_event) {
                      if(err3 || _event == null){
                        res.status(400).send("Can't save event detail");
                        console.error(err3);
                      }else{

                        user.event_list.push(event._id);
                        user.save(function (err,_usr) {
                          if(err){
                            res.status(400).send("Can't update user");
                            console.error(err);
                          }else{
                            res.status(200).send("Saved attendee list");
                            return;
                          }
                        });

                      }
                    });
                  }else{
                      res.status(400).send("User is attending event already");
                      return;
                  }
                }
              }
          });
        }
      });

  }
});


//need to update attendee list
app.put('/event/updateVolunteer',function (req,res) {
  var event_name = null;
  var volunteer = null;
  var status = null;
  if(req.body){
      if(typeof req.body.event_name !== 'undefined'){
        event_name = req.body.event_name;
      }else{
        res.status(400).end("No event name provided");
      }
      if(typeof req.body.email !== 'undefined'){
        volunteer = req.body.email;
      }else{
        res.status(400).end("No email provided");
      }
      if(typeof req.body.status !== 'undefined'){
        status = req.body.status;
      }else{
        res.status(400).end("No status provided");
      }
      console.log("Name " + event_name + " email " + volunteer);

      //check if event exists? then user? then add if  the exist
      USER.findOne({email: volunteer},function (err,user) {
        if(err || user == null){
          res.status(400).send("Invalid User");
          console.error(err);
          return;
        }else{
          //find the event
          console.log("Found the user" + user);
          EVENT.findOne({name: event_name},function (err2,event) {
              if(err2 || event == null){
                res.status(400).send("Invalid Event");
                console.error(err2);
                return;
              }else{

                var removal_index;
                console.log("Found the event " + event);
                  //check if the user already exist in the array
                  var found_user = event.volunteer_list.find(function (vol,index,array) {
                    if(user._id.equals(vol.u_id)){
                      if(status == 3){
                        removal_index = index;
                        return true;
                      }else{
                      array[index].apv = status;
                      console.log("Update is ");
                      console.log(array[index]);
                      console.log(event.volunteer_list);
                      return true;
                      }
                    }
                  });

                  if(typeof removal_index !== 'undefined' ){
                    event.volunteer_list.splice(removal_index,1);
                  }
                  console.log("Search of array list is " + found_user);
                  if(typeof found_user !== 'undefined' && found_user != null){
                    if(typeof event.confirmed_volunteers === 'undefined')
                      event.confirmed_volunteers = 0;
                    else if (status == 1) {
                      event.confirmed_volunteers += 1;
                    }else if (status == 2) {
                      if(event.confirmed_volunteers > 0)
                        event.confirmed_volunteers -= 1;
                    }
                    event.markModified('volunteer_list');
                    event.save(function (err3,_event) {
                      if(err3 || _event == null){
                        res.status(400).send("Can't save event detail");
                        console.error(err3);
                      }else{
                          //renove the event from the user's list
                          var event_index;
                          console.log('User is ' + user);
                          var found_event = user.event_list.find(function(_evt,indx,arry) {
                            if (event._id.equals(_evt)) {
                              event_index = indx;
                              return true;
                            }
                          });

                          if(event_index !== undefined)
                          user.event_list.splice(event_index,1);
                          user.markModified('volunteer_list');

                          user.save(function (error,_usr) {
                              if(error){
                                res.status(400).send("Can't save user detail");
                                console.error(err3);
                              }else{
                                res.status(200).send("Updated attendee list");
                                return;
                              }
                          });
                      }
                    });
                  }else{
                      res.status(400).send("User has not rsvped");
                      return;
                  }
              }
          });
        }
      });

  }
});


//User
app.put('/user', function(req, res) {

    var data = {};
	console.log(req.body);
    //not using first name and last name ??
    if(req.body && req.body.name !== 'undefined')
        data.name = req.body.name;

    if(req.body && req.body.email !== 'undefined')
        data.email = req.body.email;

    if(req.body && req.body.age !== 'undefined')
        data.age = req.body.age;

    if(req.body && req.body.birth_date !== 'undefined')
        data.birth_date = req.body.birth_date;

    if(req.body && req.body.interests !== 'undefined')
        data.interests = req.body.interests;

    if(req.body && req.body.skills !== 'undefined')
        data.skills = req.body.skills;

    if(req.body && req.body.activity !== 'undefined')
        data.activity = req.body.activity;

    if(req.body && req.body.groups !== 'undefined')
        data.groups = req.body.groups;

    if(req.body && req.body.address !== 'undefined')
        data.address = req.body.address;

    if(req.body && req.body.number !== 'undefined'){
        data.number = req.body.number;
        console.log("Phone number is " + data.number);
      }


     USER.findOne({email: data.email}, function(err, result) {
        if(err) {
            res.status(400).end();
            return console.error(err);
        }
        console.log("GET sucessful" + result);

        var query = { _id: result._id };
        USER.findOneAndUpdate(query,data, function(err, success ) {
            if (err) {
                res.status(400).end();
                return console.error(err);
            }
            console.log("Put search result is " + success);
            res.status(200).end();
        })
        //return duplicate results for now
    });


});
//***************************************** DELETE *************************//

//User
app.delete('/user', function(req, res) {
    var email = req.body.email;
    USER.remove({email: email}, function(err) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }else{
          res.status(200).end();
        }
    });
});

//Event
app.delete('/event', function(req, res) {
    var name = req.body.event_name;
    EVENT.remove({name: name}, function(err) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }else{
          res.status(200).end();
        }
    });
});

//Organization
app.delete('/organization',function(req, res) {
    var email = req.body.email;
    ORG.remove({email: email}, function(err) {
        if (err) {
            res.status(400).end();
            return console.error(err);
        }else{
          res.status(200).end();
        }
    });
});

server.listen(3000);
console.log('Express server started on port %s', server.address().port)
