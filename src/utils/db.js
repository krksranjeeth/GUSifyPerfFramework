const mongodb = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

const constants = require("../utils/constants");

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(client => {
        const db = client.db();

        collection_sf_record_mapping = db.collection(constants.SF_RECORD_MAPPING);
        collection_sf_work = db.collection(constants.SF_WORK);
        collection_sf_work_history = db.collection(constants.SF_WORK_HISTORY);
    })
    .catch(error => { console.error("Error in catch block", error) });

function insertDocument(collection, collectionName, data) {
    collection.insertOne(data, (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log("One document inserted in " + collectionName + " collection.");
        }
    });
}

function insertManyDocuments(collection, collectionName, data) {
    collection.insertMany(data, (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log("Successfully inserted " + res.insertedCount + " records in " + collectionName + " collection.");
        }
    });
}


module.exports = {

    getSFId: function getSFId(sf_field_ref, object_Value, callback) {
        const query = { 'SF_Field_Ref': sf_field_ref, 'Object_Value': object_Value };
        const fields = { projection: { _id: false, SF_ID: true } };
        collection_sf_record_mapping.find(query, fields).toArray()
            .then(result => {
                if (result != undefined && result.length > 0) {
                    callback(result[0].SF_ID);
                } else {
                    callback("");
                }
            })
            .catch(error => {
                console.error("Error in getSFId -> ", error);
            });
    },

    captureWorkDataChanges: function captureWorkDataChanges(updateList) {
        let bulk = collection_sf_work.initializeUnorderedBulkOp(),
            totalRecords = Object.keys(updateList).length,
            workIdField = [constants.ID.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE];

        for (let i = 0; i < totalRecords; i++) {
            let workIdValue = Object.keys(updateList[i]).pop();
            bulk.find({ [workIdField]: workIdValue }).update({ $set: updateList[i][workIdValue] });

        }
        bulk.execute();
    },

    listOpenWork: function listOpenWork(callback) {

        let idField = [constants.ID.FIELD_REF] + "." + [constants.DB_FIELD_NAME.SF_VALUE],
            nameField = [constants.ID.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            subjectField = [constants.SUBJECT.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            productTagField = [constants.PRODUCT_TAG.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            themeField = [constants.THEME.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            priorityField = [constants.PRIORITY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            statusField = [constants.STATUS.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            createdBy = [constants.CREATED_BY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            createdDate = [constants.CREATED_DATE.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            lastModifiedBy = [constants.LAST_MODIFIED_BY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            lastModifiedDate = [constants.LAST_MODIFIED_DATE.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE];
        const query = { [statusField]: { "$in": constants.WORK_STATUS_OPEN_DB } };
        const fields = {
            projection: {
                _id: false, [idField]: true, [nameField]: true
                , [subjectField]: true, [statusField]: true
                , [productTagField]: true
                , [themeField]: true, [priorityField]: true
                , [createdBy]: true, [createdDate]: true
                , [lastModifiedBy]: true, [lastModifiedDate]: true
            }
        };

        collection_sf_work.find(query, fields).toArray()
            .then(result => {
                if (result != undefined && result.length > 0) {
                    callback(result);
                } else {
                    callback("");
                }
            })
            .catch(error => {
                console.error("Error in getSFId -> ", error);
            });
    },
    
    listOpenWorkWithAllFields: function listOpenWorkWithAllFields(callback) {

        let statusField = [constants.STATUS.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE];
        const query = { [statusField]: { "$in": constants.WORK_STATUS_OPEN_DB } };
        const fields = {
            projection: {
                _id: false
            }
        };

        collection_sf_work.find(query, fields).toArray()
            .then(result => {
                if (result != undefined && result.length > 0) {
                    callback(result);
                } else {
                    callback("");
                }
            })
            .catch(error => {
                console.error("Error in getSFId -> ", error);
            });
    },

    getWorkId: function getWorkId(work_id, callback) {
        let idField = [constants.ID.FIELD_REF] + "." + [constants.DB_FIELD_NAME.SF_VALUE],
            nameField = [constants.ID.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            subjectField = [constants.SUBJECT.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            productTagField = [constants.PRODUCT_TAG.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            themeField = [constants.THEME.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            priorityField = [constants.PRIORITY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            statusField = [constants.STATUS.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            createdBy = [constants.CREATED_BY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            createdDate = [constants.CREATED_DATE.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            lastModifiedBy = [constants.LAST_MODIFIED_BY.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE],
            lastModifiedDate = [constants.LAST_MODIFIED_DATE.FIELD_REF] + "." + [constants.DB_FIELD_NAME.DB_VALUE];
        const query = {[nameField]: work_id};
        const fields = {
            projection: {
                _id: false, [idField]: true, [nameField]: true
                , [subjectField]: true, [statusField]: true
                , [productTagField]: true
                , [themeField]: true, [priorityField]: true
                , [createdBy]: true, [createdDate]: true
                , [lastModifiedBy]: true, [lastModifiedDate]: true
            }
        };
        collection_sf_work_history.find(query, fields).toArray()
            .then(result => {
                if (result != undefined && result.length > 0) {
                    callback(result);
                } else {
                    callback("");
                }
            })
            .catch(error => {
                console.error("Error in getSFId -> ", error);
            });
    }
};

sfEventEmitter.on('storeSFMappingInDB', (eventArg) => {
    insertDocument(collection_sf_record_mapping, constants.SF_RECORD_MAPPING, eventArg);
});

sfEventEmitter.on('storeSFWorkInDB', (eventArg) => {
    insertDocument(collection_sf_work, constants.SF_WORK, eventArg);
});

sfEventEmitter.on('storeSFWorkHistoryInDB', (eventArg) => {
    insertDocument(collection_sf_work_history, constants.SF_WORK_HISTORY, eventArg);
});

sfEventEmitter.on('storeManySFWorkHistoryInDB', (eventArg) => {
    insertManyDocuments(collection_sf_work_history, constants.SF_WORK_HISTORY, eventArg);
});
