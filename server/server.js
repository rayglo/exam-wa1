'use strict';

const express = require('express');
const db = require('./dbAPI')
const morgan = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocal = require("passport-local")
const session = require("express-session");

const fs = require('fs');
const secret = fs.readFileSync('./secret', 'utf8');

const base_address = "/api/"

//Passport setup
passport.use(new passportLocal.Strategy((username, password, done) => {
    db.getAdministratorForLogin(username, password).then((user) => {
        console.log(user);
        if (user)
            done(null, user);
        else
            done(null, false, {message: 'Invalid username and/or password'});
    }).catch(err => {
        done(err);
    })
}))

passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.getAdministratorByIDForDeserialization(id)
        .then(user => {
            console.log("deserialize");
            console.log(user);
            return done(null, user);
        }).catch(err => {
        done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;


app.use(morgan('dev'));
const jsonParser = bodyParser.json();

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    return res.status(401).json({message: "not authenticated"})
}

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.post(base_address + 'login/', jsonParser, function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

app.get(base_address + 'login/', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else
        res.status(401).json({error: 'Unauthenticated user!'});
    ;
});

app.delete(base_address + "logout/", isLoggedIn, (req, res) => {
    req.logout();
    res.end();
});

app.post(base_address + "survey/", isLoggedIn, jsonParser, async (req, res) => {
    console.log(req.body);
    try {
        let result = await db.addSurvey(req.user.id, req.body);
        console.log(req.body);
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get(base_address + "survey/", isLoggedIn, async (req, res) => {
    try {
        let surveys = await db.getSurveysByAdministratorID(req.user.id);
        res.status(200).send(surveys).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get(base_address + "survey/:id", async (req, res) => {
    try {
        let survey = await db.getSurveyByID(req.params.id);
        let questions = await db.getSurveyContentByID(req.params.id);
        let jsonResponse = {...survey, questions}
        console.log(jsonResponse);
        res.status(200).send(jsonResponse);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

app.delete(base_address + "survey/:id", isLoggedIn, async (req, res) => {
    try {
        let survey = await db.getSurveyByID(req.params.id);
        if (survey.AdministratorID != req.user.id)
            res.status(401).end();
        let result = await db.deleteSurvey(req.params.id);
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.post(base_address + "survey/:id/answers/", jsonParser, async (req, res) => {
    try {
        console.log(req.body);
        let result = await db.insertSurveyAnswer(req.params.id, req.body);
        res.status(200);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

app.get(base_address + "survey/:surveyID/answers/:CS_ID", isLoggedIn, jsonParser, async (req, res) => {
    try {
        console.log("sID: " + req.params.surveyID + ", csID: " + req.params.CS_ID);
        let result = await db.getSurveyAnswer(req.params.surveyID, req.params.CS_ID);
        console.log(result);
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

app.get(base_address + "administrator/:id", isLoggedIn, async (req, res) => {
    try {
        let administrators = await db.getAdministrators(req.params.id);
        res.status(200).send(administrators);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});