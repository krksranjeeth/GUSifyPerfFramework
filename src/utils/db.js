const mongodb = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

const constants = require("../utils/constants");

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(client => {
        const db = client.db();

        collection_sf_record_mapping = db.collection("sf_record_mapping");
        collection_sf_work = db.collection("sf_work");
    })
    .catch(error => { console.error("Error in catch block", error) });

function insertDocument(collection, data) {
    collection.insertOne(data, (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log("One document inserted in DB");
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
    
    insertDocument: insertDocument,

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
        const query = { [statusField]: { "$in": constants.WORK_STATUS_OPEN_DB} };
        const fields = {
            projection: {
                _id: false, [idField]: true, [nameField]: true
                , [subjectField]: true, [statusField]: true, [productTagField]: true
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
    }
};

sfEventEmitter.on('storeSFMappingInDB', (eventArg) => {
    insertDocument(collection_sf_record_mapping, eventArg);
});

sfEventEmitter.on('storeSFWorkInDB', (eventArg) => {
    insertDocument(collection_sf_work, eventArg);
});

