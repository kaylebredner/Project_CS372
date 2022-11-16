const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { reset } = require('nodemon');

let app = express()

app.use(express.static(path.join(__dirname, "./")))
app.use(bodyParser.text())
let authenticated = true;

app.get('/', (req, res) => {

    if (authenticated) {
        res.status(200).sendFile(path.join(__dirname, "/pages/dashboard.html"))
    }
    else {
        res.status(200).sendFile(path.join(__dirname, "/pages/login.html"))
    }
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

app.listen(8080)