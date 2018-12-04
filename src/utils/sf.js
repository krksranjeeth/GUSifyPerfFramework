const nforce = require('nforce');
const express = require("express");
const constants = require("./constants");


const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
let creds = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
};

const hostname = process.env.HOSTNAME

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
            redirectUri: 'http://' + hostname + '/oauth/_callback',
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
            if (err) {
                console.log('Cannot connect to Salesforce: ' + err);
                console.log("Resetting the org cache ");
                org = null;
            }
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
async function getSFId(sfFieldRef, objectValue, sfObjectName) {

    return new Promise(function (resolve, reject) {
        db.getSFId(sfFieldRef, objectValue, sfid => {
            if (sfid == "") {
                console.log(`Retrieving SF Id for ${sfObjectName} from Salesforce`);
                getSFIdFromSF(sfObjectName, sfFieldRef, objectValue, sfid => {
                    if (sfid != "") {
                        const data = { [constants.DB_FIELD_NAME.SF_FIELD_REF]: sfFieldRef, [constants.DB_FIELD_NAME.OBJECT_VALUE]: objectValue, [constants.DB_FIELD_NAME.SF_ID]: sfid };
                        sfEventEmitter.storeSFMappingInDB(data);
                        resolve(sfid);
                    } else {
                        reject("Salesforce Id is not found in DB and Salesforce");
                    }
                });
            } else {
                console.log(`Retrieving SF Id for ${sfObjectName} from DB`)
                resolve(sfid);
            }
        })
    });
}

async function getSFName(sfObjectName, objectId) {
    return new Promise(function (resolve, reject) {
        getSFNameFromSF(sfObjectName, objectId, sfName => {
            if (sfName != "") {
                resolve(sfName);
            } else {
                reject("Salesforce Name is not found in DB and Salesforce");
            }
        });
    });
}


function getSFIdFromSF(sfObjectName, sfFieldRef, objectValue, callback) {
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
}

function getSFNameFromSF(sfObjectName, objectId, callback) {
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
}

module.exports = {
    getSFId: getSFId,

    getSFIdFromSF: getSFIdFromSF,

    getSFNameFromSF: getSFNameFromSF,

    getUpdatableSFWorkData: function getUpdatableSFWorkData(workSFIdList, callback) {
        authenticate(cb => {

            const query = "SELECT " + (constants.ID.FIELD_REF).toUpperCase() + ", "
                + (constants.NAME.FIELD_REF).toUpperCase() + ", "
                + (constants.STATUS.FIELD_REF).toUpperCase() + ", "
                + (constants.PRIORITY.FIELD_REF).toUpperCase() + ", "
                + (constants.SUBJECT.FIELD_REF).toUpperCase() + ", "
                + (constants.LAST_MODIFIED_BY.FIELD_REF).toUpperCase() + ", "
                + (constants.LAST_MODIFIED_DATE.FIELD_REF).toUpperCase() + ", "
                + (constants.PRODUCT_TAG.FIELD_REF).toUpperCase()
                + " FROM " + (constants.WORK.OBJECT_NAME).toUpperCase()
                + " WHERE " + (constants.ID.FIELD_REF).toUpperCase() + " in (" + workSFIdList + ")";

            querySF(query, results => {
                if (results != "") {
                    let totalItems = Object.keys(results.records).length,
                        workDetails = {};

                    for (let i = 0; i < totalItems; i++) {
                        let workId = results.records[i]._fields[(constants.NAME.FIELD_REF).toLowerCase()];
                        workDetails[workId] = [];
                        workDetails[workId].push({
                            [constants.ID.FIELD_REF]: results.records[i]._fields[(constants.ID.FIELD_REF).toLowerCase()]
                            , [constants.STATUS.FIELD_REF]: results.records[i]._fields[(constants.STATUS.FIELD_REF).toLowerCase()]
                            , [constants.PRIORITY.FIELD_REF]: results.records[i]._fields[(constants.PRIORITY.FIELD_REF).toLowerCase()]
                            , [constants.SUBJECT.FIELD_REF]: results.records[i]._fields[(constants.SUBJECT.FIELD_REF).toLowerCase()]
                            , [constants.LAST_MODIFIED_BY.FIELD_REF]: results.records[i]._fields[(constants.LAST_MODIFIED_BY.FIELD_REF).toLowerCase()]
                            , [constants.LAST_MODIFIED_DATE.FIELD_REF]: results.records[i]._fields[(constants.LAST_MODIFIED_DATE.FIELD_REF).toLowerCase()]
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
                this.getSFNameFromSF(constants.USER.OBJECT_NAME, workDetails[constants.CREATED_BY.FIELD_REF], sfName => {

                    data[constants.CREATED_BY.FIELD_REF] = {
                        [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.CREATED_BY.FIELD_REF]
                        , [constants.DB_FIELD_NAME.DB_VALUE]: sfName
                    };
                    this.getSFNameFromSF(constants.USER.OBJECT_NAME, workDetails[constants.LAST_MODIFIED_BY.FIELD_REF], sfName => {
                        data[constants.LAST_MODIFIED_BY.FIELD_REF] = {
                            [constants.DB_FIELD_NAME.SF_VALUE]: workDetails[constants.LAST_MODIFIED_BY.FIELD_REF]
                            , [constants.DB_FIELD_NAME.DB_VALUE]: sfName
                        };
                        sfEventEmitter.storeSFWorkInDB(data);
                        sfEventEmitter.storeSFWorkHistoryInDB(data);
                        callback(sfId, workDetails[constants.NAME.FIELD_REF]);
                    })
                });
            });
        });
    },
    refreshSFWorkData: function refreshSFWorkData(callback) {

        db.listOpenWorkWithAllFields(dbWorkDetails => {
            let dbTotalItems = Object.keys(dbWorkDetails).length,
                workSFIdList = "";
            for (let i = 0; i < dbTotalItems; i++) {
                let workSFId = dbWorkDetails[i][constants.ID.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE];
                workSFIdList = workSFIdList + ((i != dbTotalItems - 1) ? "'" + workSFId + "'," : "'" + workSFId + "'");
            }
            this.getUpdatableSFWorkData(workSFIdList, async sfWorkDetails => {
                let latestRecordList = {};
                latestRecordList[0] = [];

                let updateRecordsList = " [";


                for (let i = 0; i < dbTotalItems; i++) {
                    let dbRecord = dbWorkDetails[i],
                        sfRecord = sfWorkDetails[dbRecord[constants.ID.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE]][0],
                        workId = dbRecord[constants.ID.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE],
                        tempUpdateRecordsList = "",
                        needUpdate = false;
                    if (updateRecordsList.length > 2) {
                        tempUpdateRecordsList = tempUpdateRecordsList + ",";
                    }
                    tempUpdateRecordsList = tempUpdateRecordsList + "{\"" + workId + "\": {";

                    if (dbRecord[constants.STATUS.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] != sfRecord[constants.STATUS.FIELD_REF]) {
                        needUpdate = true;

                        dbRecord[constants.STATUS.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = sfRecord[constants.STATUS.FIELD_REF];
                        dbRecord[constants.STATUS.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = sfRecord[constants.STATUS.FIELD_REF];
                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        updateRecordsList = updateRecordsList + "\"" + [constants.STATUS.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.STATUS.FIELD_REF]) + ",";
                    }

                    if (dbRecord[constants.PRIORITY.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] != sfRecord[constants.PRIORITY.FIELD_REF]) {
                        needUpdate = true;

                        dbRecord[constants.PRIORITY.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = sfRecord[constants.PRIORITY.FIELD_REF];
                        dbRecord[constants.PRIORITY.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = sfRecord[constants.PRIORITY.FIELD_REF];
                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        updateRecordsList = updateRecordsList + "\"" + [constants.PRIORITY.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.PRIORITY.FIELD_REF]) + ",";

                    }
                    if (dbRecord[constants.SUBJECT.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] != sfRecord[constants.SUBJECT.FIELD_REF]) {
                        needUpdate = true;

                        dbRecord[constants.SUBJECT.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = sfRecord[constants.SUBJECT.FIELD_REF];
                        dbRecord[constants.SUBJECT.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = sfRecord[constants.SUBJECT.FIELD_REF];
                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        updateRecordsList = updateRecordsList + "\"" + [constants.SUBJECT.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.SUBJECT.FIELD_REF]) + ",";

                    }
                    if (dbRecord[constants.PRODUCT_TAG.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] != sfRecord[constants.PRODUCT_TAG.FIELD_REF]) {
                        needUpdate = true;

                        dbRecord[constants.PRODUCT_TAG.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = sfRecord[constants.PRODUCT_TAG.FIELD_REF];
                        dbRecord[constants.PRODUCT_TAG.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = await getSFId(constants.PRODUCT_TAG.FIELD_REF
                            , sfRecord[constants.PRODUCT_TAG.FIELD_REF]
                            , constants.PRODUCT_TAG.OBJECT_NAME);
                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        updateRecordsList = updateRecordsList + "\"" + [constants.PRODUCT_TAG.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.PRODUCT_TAG.FIELD_REF]) + ",";
                    }

                    if (needUpdate) {


                        dbRecord[constants.LAST_MODIFIED_BY.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = sfRecord[constants.LAST_MODIFIED_BY.FIELD_REF];
                        dbRecord[constants.LAST_MODIFIED_BY.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = await getSFName(constants.USER.OBJECT_NAME
                            , sfRecord[constants.LAST_MODIFIED_BY.FIELD_REF]);

                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        
                        updateRecordsList = updateRecordsList + "\"" + [constants.LAST_MODIFIED_BY.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.LAST_MODIFIED_BY.FIELD_REF]) + ",";


                        dbRecord[constants.LAST_MODIFIED_DATE.FIELD_REF][constants.DB_FIELD_NAME.DB_VALUE] = sfRecord[constants.LAST_MODIFIED_DATE.FIELD_REF];
                        dbRecord[constants.LAST_MODIFIED_DATE.FIELD_REF][constants.DB_FIELD_NAME.SF_VALUE] = sfRecord[constants.LAST_MODIFIED_DATE.FIELD_REF];
                        if (tempUpdateRecordsList != "") {
                            updateRecordsList = updateRecordsList + tempUpdateRecordsList;
                            tempUpdateRecordsList = ""
                        }
                        updateRecordsList = updateRecordsList + "\"" + [constants.LAST_MODIFIED_DATE.FIELD_REF] + "\":" + JSON.stringify(dbRecord[constants.LAST_MODIFIED_DATE.FIELD_REF]) + "}}";

                        latestRecordList[0].push(dbRecord);
                    }
                }
                updateRecordsList = updateRecordsList + " ]";

                if (latestRecordList[0].length > 0) {
                    console.log("Initiating record update for " + latestRecordList[0].length + " records to be in sync with Salesforce");
                    db.captureWorkDataChanges(JSON.parse(updateRecordsList));
                    sfEventEmitter.storeManySFWorkHistoryInDB(latestRecordList[0]);
                } else {
                    console.log("No records to be updated");
                }

                callback();
            });

        });



    },
    createThemeRecord: function createThemeRecord(objectName, data, callback) {
        insertSF(objectName, data, (sfId) => {
            callback(sfId);
        });
    }
};



