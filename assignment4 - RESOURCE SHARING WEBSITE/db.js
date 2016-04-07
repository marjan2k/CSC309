//***************************************** SCHEMA  *************************//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
mongoose.connect('mongodb://localhost:12345');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Connected to MongoDB');
});


//models
db.models = {};
db.ObjectId = ObjectId;

/* Organization
  1. UserName:
  2. Organization Name:
  3. Organization Type:  registered charity| community group | Corporation
  4. Organization Field:
  5. Email:
  6. Password;
  7. Website:
  8. Description:
  9. Location:
  10. Phone:
  11. Permission_id :
*/

var orgSchema = new Schema({
  organization: {type: String, unique:true},
  type: String,
  field: String,
  email: {type: String, unique: true},
  website: String,
  description: String,
  address: String,
  number: String,
  permission_id: Schema.Types.ObjectId      //Reference to the list of users with permission
});

orgSchema.index({"$**" : "text"});
orgSchema.indexes();

var ORG = mongoose.model('ORG',orgSchema);

db.models.ORG = ORG;

var permSchema = new Schema({
  user_ids: [Schema.Types.ObjectId]
});

var PERM = mongoose.model('PERM',permSchema);
db.models.PERM = PERM;

/* Event
  1. Organization:
  2. Description:
  3. Date:
  4. Location:
  5. LookingFor:
  6. #volunteers:
  7. Confirmed Volunteers:
  8. Event name ?
*/

var eventSchema = new Schema ({
    name: { type:String, unique: true, dropDups:true},
    organization: String,
    description: String,
    date: Date,
    location: String,
    lookingFor: String,
    num_of_volunteers: Number,
    confirmed_volunteers: {type: Number, default: 0},
    volunteer_list: [Schema.Types.Mixed],      // {u_id: xxxxxx, apv: 0|1|2}
    org_id: Schema.Types.ObjectId,
    status: Number
});

eventSchema.index({"$**" : "text"});
eventSchema.indexes();
var EVENT = mongoose.model('EVENT', eventSchema);
db.models.EVENT = EVENT;


var userSchema = new Schema({
  name: String,
  id: String,
  token: String,
  email:{type: String,unique: true, dropDups: true},
  password: String,
  age: String,
  img: String,
  birth_date: Date,
  interests: String,
  skills: String,
  activity: [String],
  groups: [String],
  number: String,
  address: String,
  event_list: [Schema.Types.ObjectId],
  whoami: {type: String, default:"user"},
  organization_id: Schema.Types.ObjectId    //reference to the organization they belong too
});

userSchema.index({"$**" : "text"});
userSchema.indexes();
var USER = mongoose.model('USER', userSchema);
db.models.USER = USER;

module.exports = db;

//})
