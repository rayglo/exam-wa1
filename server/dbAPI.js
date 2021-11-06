'use strict'

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite.Database('database.db', (err) => {
    if (err) {
        throw err;
    }
});

async function getSurveysByAdministratorID(administratorID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM SURVEY_MODEL WHERE AdministratorID=?";
        console.log(query);
        db.all(query, [administratorID], async (err, rows) => {
            if (err)
                reject(err);
            else {
                resolve(rows);
            }
        });
    });
};

async function addSurvey(administratorID, json) {
    return new Promise(async (resolve, reject) => {
        const query1 = "INSERT INTO SURVEY_MODEL(AdministratorID, Name, CreationDate) VALUES(?,?,?)"
        const query2 = "INSERT INTO QUESTION(SurveyID, QuestionID, Type, Content) VALUES(?,?,?,?)"
        db.serialize(async () => {
            let insertedID;
            console.log(query1)
            db.run(query1, [administratorID, json.surveyName, json.creationDate], function (err) {
                if (err) {
                    reject(err)
                }
                insertedID = this.lastID;
            });

            setTimeout(() => {
                console.log(query2);
                for (let q of json.questions)
                    db.run(query2, [insertedID, q.questionID, q.type, JSON.stringify(q.content)], function (err) {
                        if (err) {
                            reject(err);
                        }
                    });
            }, 2000);

        });
        resolve();
    })
}

async function deleteSurvey(surveyID) {
    return new Promise(async (resolve, reject) => {
        const query1 = "DELETE FROM SURVEY_MODEL WHERE SurveyID=?;";
        const query2 = "DELETE FROM QUESTION WHERE SurveyID=?;";
        const query3 = "DELETE FROM COMPILED_SURVEY WHERE SurveyID=?;";
        db.serialize(() => {
                console.log(query1);

                db.run(query1, [surveyID], (err) => {
                    if (err)
                        reject(err);
                })
                console.log(query2);
                db.run(query2, [surveyID], (err) => {
                    if (err)
                        reject(err);
                })
                console.log(query3);
                db.run(query3, [surveyID], (err) => {
                    if (err)
                        reject(err);
                });
            }
        );
        resolve();
    });
}

async function getAdministratorByID(administratorID = undefined) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM ADMINISTRATOR" + (administratorID == undefined ? "" : " WHERE AdministratorID=?");
        console.log(query);
        db.get(query, [administratorID], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve(false);
            else
                resolve(row);
        });
    });
};

async function getAdministratorByIDForDeserialization(administratorID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM ADMINISTRATOR WHERE AdministratorID=?";
        console.log(query);
        db.get(query, [administratorID], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve(false);
            else
                resolve({id: row.AdministratorID, username: row.Username});
        });
    });
};

async function getAdministratorForLogin(username, password) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ADMINISTRATOR WHERE Username = ?;'
        console.log(query);
        db.get(query, [username], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve(false);
            else {
                bcrypt.compare(password, row.Password).then(result => {
                    if (result)
                        resolve({id: row.AdministratorID, username: row.Username});
                    else
                        resolve(false);
                });
            }
        })
    })
};

async function getAdministrators(administratorID = undefined) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM ADMINISTRATOR" + (administratorID == undefined ? "" : " WHERE AdministratorID=?");
        console.log(query);
        db.all(query, [administratorID], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

async function getSurveyByID(surveyID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM SURVEY_MODEL WHERE SurveyID=?";
        console.log(query);
        db.get(query, [surveyID], (err, row) => {
            if (err)
                reject(err);
            else {
                resolve(row);
            }
        });
    });
}

async function getSurveyContentByID(surveyID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM QUESTION WHERE SurveyID=?";
        console.log(query);
        db.all(query, [surveyID], (err, rows) => {
            if (err)
                reject();
            else
                resolve(rows);
        });
    });
}

async function insertSurveyAnswer(surveyID, json) {
    return new Promise(async (resolve, reject) => {
        const query0 = "SELECT MAX(CS_ID) as max FROM COMPILED_SURVEY WHERE SurveyID=?";
        const query1 = "INSERT INTO COMPILED_SURVEY(CS_ID, SurveyID, Username, submitDate, Content) VALUES(?,?,?,?,?)"
        const query2 = "UPDATE SURVEY_MODEL SET NumberAnswered=NumberAnswered+1 WHERE SurveyID = ?";
        let answers = json.answers.map(a => JSON.stringify(a));
        answers = '[' + answers.toString() + ']';
        console.log("answers stored");
        console.log(answers);
        let cs_id;
        db.serialize(async () => {
            console.log(query0);
            db.get(query0, [surveyID], function (err, row) {
                if (err)
                    reject(err);
                else
                    cs_id = row['max'] == null ? 1 : row['max'] + 1;
            });

            setTimeout(() => {
                console.log("cs_id: " + cs_id);
                console.log(query1);
                db.run(query1, [cs_id, surveyID, json.name, json.submitDate, answers], function (err) {
                    if (err) {
                        reject(err)
                    }
                });
                console.log(query2);
                db.run(query2, [surveyID], function (err) {
                    if (err) {
                        reject(err)
                    }
                })
            }, 3000);
        });
        resolve();
    })
}

async function getSurveyAnswer(surveyID, CS_ID) {
    return new Promise(async (resolve, reject) => {
        const query = "SELECT * FROM COMPILED_SURVEY WHERE SurveyID=? AND CS_ID=?";
        console.log(query);
        db.get(query, [surveyID, CS_ID], function (err, row) {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}


module.exports = {
    addSurvey,
    getSurveysByAdministratorID,
    getAdministratorForLogin,
    getAdministratorByID,
    getAdministrators,
    getSurveyByID,
    getSurveyContentByID,
    insertSurveyAnswer,
    getSurveyAnswer,
    getAdministratorByIDForDeserialization,
    deleteSurvey,
};