const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { reset } = require('nodemon');
const mongoose = require('mongoose');
const{ Schema } = mongoose;
const moment = require('moment');

mongoose.connect('mongodb+srv://alex:alex@cluster0.gr3zesx.mongodb.net/test')

//model for 'LoginInfo' table
var userModel = mongoose.model('LoginInfo', new Schema({
   userName: String,
   password: String,
   email: String,
   authenticated: Number,
   authenticateTime: String
}), 'LoginInfo');

var eventModel = mongoose.model('Events', new Schema({
    username: String,
    title: String,
    start: String,
    end: String,
 }), 'Events');

let app = express()

app.use(express.static(path.join(__dirname, "./")))
app.use(bodyParser.urlencoded({ extended: false }))
//this won't work for multiple users, once one user is authenticated it will read true for all users
let authenticated = true;

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "/pages/login.html"))
})

app.get('/dashboard/:userName', (req, res) => {
console.log(req.params.userName)
    new Promise((resolve, reject)=> {
        resolve(isAuthenticated(req.params.userName));
    }).then((value)=>{
        console.log(value)
        if (value) {
            res.status(200).sendFile(path.join(__dirname, "/pages/dashboard.html"))
        }
        else {
            res.status(200).sendFile(path.join(__dirname, "/pages/login.html"))
        }
    })
        
        
})

//create user in database from request data
app.post('/signUp', (req, res) => {
    //create user object
    //storing the password as plain text is bad for security, but i'm going to do it anyway
    const user = {}
    user.userName = req.body.user;
    user.password = req.body.pass;
    user.email = req.body.email;
    user.authenticated = 1;
    user.authenticateTime = moment();
    const url = '/'+user.userName
    userModel.find({'userName': req.body.user}, function(err, data){
        if(err) return
        if(data.length===0){
            console.log('user does not exist')
            userModel.create(user)
            res.status(200).send(user.userName)
        }
        else{
            console.log('user exists')
            res.status(401).send("User already exists");
        }
    })
    console.log(user);
    
})

//finds user by username/email and checks password against what is stored in db, responds with user token, pass this token into other requests to ensure user is logged in
app.post('/login', (req, res) => {
    //console.log(req.body);
    const userName = req.body.user;
    const pw = req.body.pass;
    const now = moment()
    //do validation here
    //lookup user by userName
    userModel.findOne({'userName':userName},function(err, user){
        if (err) return
        if(pw === user.password){

            authenticated = true;
            user.authenticated = 1;
            user.authenticateTime = now
            user.save();
            res.status(200).send(userName);
            console.log(userName)
            
        }
        else{
            console.log('incorrect password')
            res.status(401).send('incorrect password');
        }
    })
})

app.get('/eventsAmount/:user', (req, res) => {
    const username = req.params.user

    eventModel.find({'username':username}, function(err, data){
        if (err) return

        res.status(200).send(`${data.length}`)
    })
})

app.get('/calendar', (req, res) => {

    if (authenticated) {
        res.status(200).sendFile(path.join(__dirname, "/pages/calendar.html"))
    } else {
        res.status(200).redirect("/")
    }
})

app.get('/notes', (req, res) => {
    if (authenticated) {
        res.status(200).sendFile(path.join(__dirname, "/pages/notebook.html"))
    } else {
        res.status(200).redirect("/")
    }
})

app.get('/signup', (req, res) => {
    console.log('signup endpoint hit')
    res.status(200).sendFile(path.join(__dirname, "/pages/signup.html"))
})

app.get('/signout', (req, res) => {
    //unauthenticate
    authenticated = false
    res.status(200).redirect("/")
})

app.post('/', (req, res) => {

})

//takes the user name then determines if the user is authenticated or not
async function isAuthenticated(user){
    let userData = await userModel.findOne({'userName':user})
    console.log(userData); 
    if(userData!=null){
        if(userData.authenticated===1){
            const authTime =moment(userData.authenticateTime);
            const now = moment()
            if(now.isSameOrBefore(authTime.add(1,'h'))){
                userModel.findOne({'userName':user}, function(err, data){
                    
                })
                //somehow need to refresh auth time here so the user isn't required to log back in after an hour
                return true;
            }
        }
        return false
    }
    return false;
}


app.listen(8080)
