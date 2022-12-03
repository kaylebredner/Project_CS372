const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { reset } = require('nodemon');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

// Schema for Notes
const noteSchema = new mongoose.Schema({
    id: Number,
    title: String,
    body: String,
    updated: Date
})

mongoose.connect('mongodb+srv://alex:alex@cluster0.gr3zesx.mongodb.net/test')

// Model for 'LoginInfo' table
var userModel = mongoose.model('LoginInfo', new Schema({
    userName: String,
    password: String,
    email: String,
    authenticated: Number,
    authenticateTime: String
}), 'LoginInfo');

const NotesM = mongoose.model('Notes', noteSchema)

let app = express()

app.use(express.static(path.join(__dirname, "./")))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())
app.use(bodyParser.json())
//this won't work for multiple users, once one user is authenticated it will read true for all users
let authenticated = true;

app.get('/', (req, res) => {

    if (authenticated) {
        res.status(200).sendFile(path.join(__dirname, "/pages/dashboard.html"))
    }
    else {
        res.status(200).sendFile(path.join(__dirname, "/pages/login.html"))
    }
})

//create user in database from request data
app.post('/signUp', (req, res) => {
    //create user object
    //storing the password as plain text is bad for security, but i'm going to do it anyway
    let user = {}
    user.userName = req.body.user;
    user.password = req.body.pass;
    user.email = req.body.email;
    user.authenticated = 0;
    user.authenticateTime = '';
    userModel.find({ 'userName': req.body.user }, function (err, data) {
        if (err) return
        if (data.length === 0) {
            userModel.create(user)
            res.status(200).redirect("/")
        }
        else {
            res.status(200).send("User already exists");
        }
    })
    console.log(user);

})

// Retrieve list of notes from the DB and return to page
app.get('/get_notes', async function (req, res) {
    // Get all notes in the database then send them back
    res.status(200).send(await getNotes())
})

function getNotes() { // Helper function to get all notes stored in the database
    const notes = NotesM.find({})
    return notes
}

// Get list of notes from page and save to DB
app.post('/save_notes', function (req, res) {
    // Save posted info into new Note
    const notes = {
        id: req.body.id,
        updated: req.body.updated,
        title: req.body.title,
        body: req.body.body
    }

    // Create note in database
    NotesM.create(notes) // TODO: Check if new note is created when updating
    res.status(200).send("Note created!")
})

//finds user by username/email and checks password against what is stored in db, responds with user token, pass this token into other requests to ensure user is logged in
app.post('/login', (req, res) => {
    //console.log(req.body);
    const userName = req.body.user;
    const pw = req.body.pass;
    const now = moment()
    //do validation here
    //lookup user by userName
    userModel.findOne({ 'userName': userName }, function (err, user) {
        if (err) return
        if (pw === user.password) {
            authenticated = true;
            user.authenticated = 1;
            user.authenticateTime = now
            user.save();
            isAuthenticated(user.userName)
            res.status(200).redirect("/")

        }
        else {
            console.log('incorrect password')
            res.status(401).send("Incorrect Password");
        }
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
    res.status(200).sendFile(path.join(__dirname, "/pages/signup.html"))
})

app.get('/signout', (req, res) => {
    //unauthenticate
    authenticated = false
    res.status(200).redirect("/")
})

app.post('/', (req, res) => {

})

function isAuthenticated(user) {
    userModel.findOne({ 'userName': user }, function (err, user) {
        if (err) return false
        if (user.authenticated === 1) {
            //ensure the user was authenticated at most 1 hour ago
            const authTime = moment(user.authenticateTime);
            const now = moment()
            if (now.isSameOrBefore(authTime.add(1, 'h'))) {
                //if authenticated less than 1 hour ago, refresh authenticate time, then return true
                user.authenticateTime = now
                user.save()
                return true
            }
            return false
        }
        else {
            return false
        }
    })
}


app.listen(8080)
