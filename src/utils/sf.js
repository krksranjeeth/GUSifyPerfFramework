const nforce = require('nforce');
const express = require("express");
const constants = require("./constants");


const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
let creds = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
};

const SFEventEmitter = require("../emitter/sfevent.js");
global.sfEventEmitter = new SFEventEmitter();
const db = require("./db");
let org = null;

function createConnection() {
    if ((CONSUMER_KEY != null) && (CONSUMER_SECRET != null)) {
        console.log("Initiating new connection with salesforce...");
        org = nforce.createConnection({
            clientId: CONSUMER_KEY,
            clientSecret: CONSUMER_SECRET,
            redirectUri: 'http://localhost:5000/oauth/_callback',
            apiVersion: 'v44.0',
            mode: 'single'
        });
        return true;
    } else {
        throw console.error("Please verify consumer key and consumer secret");
    }
}

function authenticate(callback) {
    if (org == null) {
        createConnection()
    }

    console.log("Authenticating with salesforce...");
    org.authenticate(creds,
        function (err, resp) {
            if (!err) {
                callback();
            }
            if (err) console.log('Cannot connect to Salesforce: ' + err);
        });
}

function querySF(query, callback) {

    org.query({ query: query }, (err, result) => {
        if (!err) {
            if (result.records != "") {
                callback(result);
            } else {
                callback();
                console.log("Error occurred while fetching salesforce id" + err);
            }
        }
        else {
            callback();
            console.log("Error occurred while fetching salesforce id" + err);
        }
    });
}

function insertSF(objectName, data, callback) {
    let record = nforce.createSObject(objectName);
    for (let attributename in data) {
        record.set(attributename, data[attributename].sf_value);
    }

    authenticate(cb => {
        org.insert({ sobject: record }, (err, resp) => {
            if (!err) {
                console.log('Inserted record with ID - ' + resp.id + ' for ' + objectName);
                callback(resp.id);
            } else {
                console.log(err);
            }
        });
    });
}

module.exports = {
    getSFId: function getSFId(sfObjectName, sfFieldRef, objectValue, callback) {
        authenticate(cb => {
            const query = "SELECT " + (constants.ID.FIELD_REF).toUpperCase() + " FROM "
                + sfObjectName + " WHERE " + (constants.NAME.FIELD_REF).toUpperCase()
                + " ='" + objectValue + "' LIMIT 1";
            querySF(query, result => {
                if (result != "") {
                    sfId = result.records[0]._fields[(constants.ID.FIELD_REF).toLowerCase()];
                    const data = { [constants.DB_FIELD_NAME.SF_FIELD_REF]: sfFieldRef, [constants.DB_FIELD_NAME.OBJECT_VALUE]: objectValue, [constants.DB_FIELD_NAME.SF_ID]: sfId };
                    callback(sfId);
                }
            });
        });
    },
    getUpdatableSFWorkData: function getUpdatableSFWorkData(callback) {
        authenticate(cb => {

            const query = "SELECT " + (constants.ID.FIELD_REF).toUpperCase() + ", "
                + (constants.NAME.FIELD_REF).toUpperCase() + ", "
                + (constants.STATUS.FIELD_REF).toUpperCase() + ", "
                + (constants.PRIORITY.FIELD_REF).toUpperCase() + ", "
                + (constants.SUBJECT.FIELD_REF).toUpperCase() + ", "
                + (constants.PRODUCT_TAG.FIELD_REF).toUpperCase()
                + " FROM " + (constants.WORK.OBJECT_NAME).toUpperCase()
                + " WHERE " + (constants.STATUS.FIELD_REF).toUpperCase() + " in (" + constants.WORK_STATUS_OPEN_SF + ")";
            // console.log("query in getUpdatableSFWorkData "+ query);
            querySF(query, results => {
                if (results != "") {
                    let totalItems = Object.keys(results.records).length;
                    // console.log("totalItems "+totalItems);
                    console.log("results"+JSON.stringify(results.records[0]._fields[(constants.NAME.FIELD_REF).toLowerCase()], undefined, '\t'));
                    let workDetails = {};
                    
                    for (let i=0; i<totalItems; i++) {
                        let workId = results.records[i]._fields[(constants.NAME.FIELD_REF).toLowerCase()];
                        // console.log("workId"+results.records[i]._fields[(constants.NAME.FIELD_REF).toLowerCase()])
                        workDetails[workId]=[]
                        workDetails[workId].push({
                            [constants.ID.FIELD_REF]: results.records[i]._fields[(constants.ID.FIELD_REF).toLowerCase()]
                            , [constants.STATUS.FIELD_REF]: results.records[i]._fields[(constants.STATUS.FIELD_REF).toLowerCase()]
                            , [constants.PRIORITY.FIELD_REF]: results.records[i]._fields[(constants.PRIORITY.FIELD_REF).toLowerCase()]
                            , [constants.SUBJECT.FIELD_REF]: results.records[i]._fields[(constants.SUBJECT.FIELD_REF).toLowerCase()]
                            , [constants.PRODUCT_TAG.FIELD_REF]: results.records[i]._fields[(constants.PRODUCT_TAG.FIELD_REF).toLowerCase()]
                        });
                       
                    };
                    
                    callback(workDetails);
                }
            });
        });
    },
    getSFWorkData: function getSFWorkData(sfObjectName, objectId, callback) {
        authenticate(cb => {

            const query = "SELECT " + (constants.NAME.FIELD_REF).toUpperCase() + ", "
                + (constants.STATUS.FIELD_REF).toUpperCase() + ", "
                + (constants.PRIORITY.FIELD_REF).toUpperCase() + ", "
                + (constants.CREATED_BY.FIELD_REF).toUpperCase() + ", "
                + (constants.CREATED_DATE.FIELD_REF).toUpperCase() + ", "
                + (constants.LAST_MODIFIED_BY.FIELD_REF).toUpperCase() + ", "
                + (constants.LAST_MODIFIED_DATE.FIELD_REF).toUpperCase()
                + " FROM " + sfObjectName
                + " WHERE " + (constants.ID.FIELD_REF).toUpperCase() + " ='" + objectId + "' LIMIT 1";
                
            querySF(query, result => {
                if (result != "") {
                    let workDetails = {
                        [constants.NAME.FIELD_REF]: result.records[0]._fields[(constants.NAME.FIELD_REF).toLowerCase()]
                        , [constants.STATUS.FIELD_REF]: result.records[0]._fields[(constants.STATUS.FIELD_REF).toLowerCase()]
                        , [constants.PRIORITY.FIELD_REF]: result.records[0]._fields[(constants.PRIORITY.FIELD_REF).toLowerCase()]
                        , [constants.CREATED_BY.FIELD_REF]: result.records[0]._fields[(constants.CREATED_BY.FIELD_REF).toLowerCase()]
                        , [constants.CREATED_DATE.FIELD_REF]: result.records[0]._fields[(constants.CREATED_DATE.FIELD_REF).toLowerCase()]
                        , [constants.LAST_MODIFIED_BY.FIELD_REF]: result.records[0]._fields[(constants.LAST_MODIFIED_BY.FIELD_REF).toLowerCase()]
                        , [constants.LAST_MODIFIED_DATE.FIELD_REF]: result.records[0]._fields[(constants.LAST_MODIFIED_DATE.FIELD_REF).toLowerCase()]
                    };
                    callback(workDetails);
                }
            });
        });
    },
    getSFName: function getSFName(sfObjectName, objectId, callback) {
        authenticate(cb => {
            const query = "SELECT " + (constants.NAME.FIELD_REF).toUpperCase() + " FROM " + sfObjectName
                + " WHERE " + (constants.ID.FIELD_REF).toUpperCase() + " ='" + objectId + "' LIMIT 1";

            querySF(query, result => {
                if (result != "") {
                    sfName = result.records[0]._fields[(constants.NAME.FIELD_REF).toLowerCase()];
                    callback(sfName);
                }
            });
        });
    },
    createWorkRecord: function createWorkRecord(objectName, data, callback) {
        insertSF(objectName, data, async (sfId) => {
            this.getSFWorkData(objectName, sfId, (workDetails) => {

                data[constants.ID.FIELD_REF] = {
                    [constants.DB_FIELD_NAME.SF_VALUE]: sfId
                    , [constants.DB_FIELD_NAME.DB_VALUE]: workDetails[constants.NAME.FIELD_REF]
                };
                data[constants.STATUS.FIELD_REF] = {
                    [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.STATUS.FIELD_REF]
                    , [constants.DB_FIELD_NAME.DB_VALUE]: workDetails[constants.STATUS.FIELD_REF]
                };
                data[constants.PRIORITY.FIELD_REF] = {
                    [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.PRIORITY.FIELD_REF]
                    , [constants.DB_FIELD_NAME.DB_VALUE]: workDetails[constants.PRIORITY.FIELD_REF]
                };
                data[constants.CREATED_DATE.FIELD_REF] = {
                    [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.CREATED_DATE.FIELD_REF]
                    , [constants.DB_FIELD_NAME.DB_VALUE]: workDetails[constants.CREATED_DATE.FIELD_REF]
                };
                data[constants.LAST_MODIFIED_DATE.FIELD_REF] = {
                    [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.LAST_MODIFIED_DATE.FIELD_REF]
                    , [constants.DB_FIELD_NAME.DB_VALUE]: workDetails[constants.LAST_MODIFIED_DATE.FIELD_REF]
                };
                this.getSFName(constants.USER.OBJECT_NAME, workDetails[constants.CREATED_BY.FIELD_REF], sfName => {

                    data[constants.CREATED_BY.FIELD_REF] = {
                        [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.CREATED_BY.FIELD_REF]
                        , [constants.DB_FIELD_NAME.DB_VALUE]: sfName
                    };
                    this.getSFName(constants.USER.OBJECT_NAME, workDetails[constants.LAST_MODIFIED_BY.FIELD_REF], sfName => {
                        data[constants.LAST_MODIFIED_BY.FIELD_REF] = {
                            [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.LAST_MODIFIED_BY.FIELD_REF]
                            , [constants.DB_FIELD_NAME.DB_VALUE]: sfName
                        };
                        sfEventEmitter.storeSFWorkInDB(data);
                        callback(sfId, workDetails[constants.NAME.FIELD_REF]);
                    })
                });
            });
        });
    },
    refreshSFWorkData: function refreshSFWorkData(callback) {

        db.listOpenWork(dbWorkDetails => {
            console.log("dbWorkDetails "+ JSON.stringify(dbWorkDetails, undefined, '\t'));
            this.getUpdatableSFWorkData(sfWorkDetails => {
                let sfTotalItems = Object.keys(sfWorkDetails).length;
                let dbTotalItems = Object.keys(dbWorkDetails).length;
                console.log("sfTotalItems "+ sfTotalItems);
                console.log("dbTotalItems "+ dbTotalItems);

                for(let i=0; i<dbTotalItems; i++) {
                    workId = dbWorkDetails[i].id.db_value;
                    console.log("dbworkitem "+ workId);
                }
               

                console.log("Got callback");
                callback(sfWorkDetails);
            });
    
        });

        
        
    },
    createThemeRecord: function createThemeRecord(objectName, data, callback) {
        insertSF(objectName, data, (sfId) => {
            callback(sfId);
        });
    }
};



