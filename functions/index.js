const functions = require("firebase-functions");
const sendRegistrationEmails = require("./sendRegistrationEmails");

exports.sendRegistrationEmails = sendRegistrationEmails;
