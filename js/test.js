const express = require('express');
const assert = require('assert');
const bodyParser = require('body-parser');
const path = require('path');
const { reset } = require('nodemon');
const moment = require('moment');
const { exit } = require('process');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env') });

//To run tests, use npx mocha test.js
var expect = require('chai').expect;

describe('Baseline test', function() {

  it('This test should pass to prove that the mocha chai testing framework is functioning correctly', function() {

    expect(5).to.equal(5);
    expect(5).to.not.equal(3);

  });

});

describe('Mongoose Connection Test', function() {

  it('This test should pass to prove that Mongoose is successfully connecting to the MongoDB database', function() {

    let mongoose = require('mongoose');
    mongoose.connect(process.env.DATABASE)

    expect(mongoose.connection.readyState).to.equal(0) 
    mongoose.connection.close();
  });
});

