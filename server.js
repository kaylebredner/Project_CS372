const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { reset } = require('nodemon');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env') });


// Schema for Notes
const noteSchema = new mongoose.Schema({
    username: String,
    id: Number,
    title: String,
    body: String,
    updated: Date
})

// Model for 'LoginInfo' table
var userModel = mongoose.model('LoginInfo', new Schema({
mongoose.connect(process.env.DATABASE)

//model for 'LoginInfo' table
const userModel = mongoose.model('LoginInfo', new Schema({
    userName: String,
    password: String,
    email: String,
    authenticated: Number,
    authenticateTime: String
}), 'LoginInfo');


const NotesM = mongoose.model('Notes', noteSchema)


const eventModel = mongoose.model('Events', new Schema({

    username: String,
    title: String,
    start: String,
    end: String,
    isNote: Boolean
}), 'Events');


const notesModel = mongoose.model('notes', new Schema({
    username: String,
    id: Number,
    title: String,
    body: String,
    updated: Date,
}), 'notes');



let app = express()

app.use(express.static(path.join(__dirname, "./")))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())
app.use(bodyParser.json())
//this won't work for multiple users, once one user is authenticated it will read true for all users
let authenticated = true;

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "/pages/login.html"))
})

app.get('/dashboard/:userName', (req, res) => {
    new Promise((resolve, reject) => {
        resolve(isAuthenticated(req.params.userName));
    }).then((value) => {
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
    const url = '/' + user.userName
    userModel.find({ 'userName': req.body.user }, function (err, data) {
        if (err) return
        if (data.length === 0) {
            userModel.create(user)
            res.status(200).send(user.userName)
        }
        else {
                    res.status(401).send("User already exists");
        }
    })
})

// Retrieve list of notes from the DB and return to page
app.get('/get_notes', async function (req, res) {
    // Get all notes in the database then send them back
    res.status(200).send(await getNotes())
})

function getNotes() { // Helper function to get all notes stored in the database
    const notes = NotesM.find()
    return notes
}

// Get list of notes from page and save to DB
app.post('/save_note', async function (req, res) {
    // Save posted info into new Note
    const note = JSON.parse(req.body)

    // Check if note exists in collection. Update if it exists and add to collection if it doesn't
    const existingNote = await NotesM.findOne({id: note.id})
    if (existingNote) { // Note already exists
        
        existingNote.title = note.title
        existingNote.body = note.body
        existingNote.updated = note.updated
        await existingNote.save()
    } else { // Create new note
        
        const newNote = await NotesM.create({
            id: note.id,
            title: note.title,
            body: note.body,
            updated: note.updated
        })
    }

    res.status(200).send("Note created!")
})

app.post('/delete_note', async function (req, res) {
    
    const note = JSON.parse(req.body)
    const conf = await NotesM.findOneAndDelete({id: note.id})
    
    res.status(200).send("Note deleted!")
})

//finds user by username/email and checks password against what is stored in db, responds with user token, pass this token into other requests to ensure user is logged in
app.post('/login', (req, res) => {
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

            res.status(200).send(userName);

        }
        else {
            res.status(401).send('incorrect password');

        }
    })
})


app.get('/eventsAmount/:user', (req, res) => {
    const username = req.params.user

    eventModel.find({'username':username}, function(err, data){
        if (err) return
        let eventsLength = 0;
        for(let i = 0; i < data.length; i++){
            if(!data[i].isNote) length += 1
        }
        res.status(200).send(`${eventsLength}`)
    })
})

app.get('/notesAmount/:user', (req, res) => {
    const username = req.params.user

    notesModel.find({'username':username}, function(err, data){
        if (err) return

        res.status(200).send(`${data.length}`)

    })
})

app.post('/fillnotes', (req, res) => {
    const username = req.body
    notesModel.find({ "username": username }, (err, ent) => {
        if (err) return
        res.status(200).send(JSON.stringify(ent))
    })
})


app.post('/fillevents', (req, res) => {
    const username = req.body
    eventModel.find({ "username": username }, (err, ent) => {
        if (err) return
        res.status(200).send(JSON.stringify(ent))
    })
})

app.post('/createnoteevent', (req, res) => {
    const request = JSON.parse(req.body)

    notesModel.collection.insertOne({
        username: request.username,
        id: request.id,
        title: request.title,
        body: request.body,
        updated: new Date(request.updated),
    })
})

app.post('/createvent', (req, res) => {
    const request = JSON.parse(req.body)
    

    eventModel.find({ "username": request.username }, (err, ent) => {
        for(let i = 0; i < ent.length; i++){
            
            if(ent[i].username === request.username && ent[i].title === request.title){
                eventModel.collection.findOneAndUpdate({"username":request.username, "title":request.title}, {$set:{"start": request.start, "end":request.end}})
                return;
            }
        }

        eventModel.collection.insertOne({
            username: request.username,
            title: request.title,
            start: request.start,
            end: request.end,
            isNote: request.isnote
        })
    })
})

app.post('/deleteevent', (req, res) => {
    const request = JSON.parse(req.body)

    eventModel.collection.findOneAndDelete({"username":request.username, "title":request.title})
})

app.get('/calendar/:user', (req, res) => {
    new Promise((resolve, reject)=> {
        resolve(isAuthenticated(req.params.user));
    }).then((value)=>{
        if (value) {
            res.status(200).sendFile(path.join(__dirname, "/pages/calendar.html"))
        }
        else {
            res.status(401).sendFile(path.join(__dirname, "/pages/login.html"))
        }
    })
})

app.get('/notes/:user', (req, res) => {

    new Promise((resolve, reject)=> {
        resolve(isAuthenticated(req.params.user));
    }).then((value)=>{
        if (value) {
            res.status(200).sendFile(path.join(__dirname, "/pages/notebook.html"))
        }
        else {
            res.status(401).sendFile(path.join(__dirname, "/pages/login.html"))
        }
    })
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


//takes the user name then determines if the user is authenticated or not
async function isAuthenticated(user) {
    let userData = await userModel.findOne({ 'userName': user })
    if (userData != null) {
        if (userData.authenticated === 1) {
            const authTime = moment(userData.authenticateTime);
            const now = moment()
            if (now.isSameOrBefore(authTime.add(1, 'h'))) {
                userModel.findOne({ 'userName': user }, function (err, data) {

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