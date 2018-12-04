function defineConstant(field, value) {
    Object.defineProperty(exports, field, {
        value: value,
        enumerable: true,
        writable: false
    });
}


//Work related metadata 
defineConstant("WORK",
    { "OBJECT_NAME": "agf__ADM_Work__c", "FIELD_REF": "agf__Work__c" });
defineConstant("PRODUCT_TAG",
    { "OBJECT_NAME": "agf__ADM_Product_Tag__c", "FIELD_REF": "agf__Product_Tag__c" });
defineConstant("SCRUM_TEAM",
    { "OBJECT_NAME": "agf__ADM_Scrum_Team__c", "FIELD_REF": "agf__Scrum_Team__c" });
defineConstant("IMPACT",
    { "OBJECT_NAME": "agf__ADM_Impact__c", "FIELD_REF": "agf__Impact__c" });
defineConstant("FREQUENCY",
    { "OBJECT_NAME": "agf__ADM_Frequency__c", "FIELD_REF": "agf__Frequency__c" });
defineConstant("FOUND_IN_BUILD",
    { "OBJECT_NAME": "agf__ADM_Build__c", "FIELD_REF": "agf__Found_in_Build__c" });
defineConstant("SCHEDULED_BUILD",
    { "OBJECT_NAME": "agf__ADM_Build__c", "FIELD_REF": "agf__Scheduled_Build__c" });
defineConstant("EPIC",
    { "OBJECT_NAME": "agf__ADM_Epic__c", "FIELD_REF": "agf__Epic__c" });
defineConstant("TYPE",
    { "OBJECT_NAME": "agf__ADM_Type__c", "FIELD_REF": "agf__Type__c" });
defineConstant("RECORD_TYPE",
    { "OBJECT_NAME": "RecordType", "FIELD_REF": "RecordTypeId" });
defineConstant("STATUS",
    { "OBJECT_NAME": "agf__ADM_Work_Status__c", "FIELD_REF": "agf__Status__c" });
defineConstant("ID",
    { "FIELD_REF": "id" });
defineConstant("NAME",
    { "FIELD_REF": "Name" });
defineConstant("SUBJECT",
    { "FIELD_REF": "agf__Subject__c" });
defineConstant("DETAILS",
    { "FIELD_REF": "agf__Details_and_Steps_to_Reproduce__c" });
defineConstant("PRIORITY",
    { "FIELD_REF": "agf__Priority__c" });
defineConstant("CREATED_DATE",
    { "FIELD_REF": "CreatedDate" });
defineConstant("LAST_MODIFIED_DATE",
    { "FIELD_REF": "LastModifiedDate" });
defineConstant("LAST_MODIFIED_BY",
    { "FIELD_REF": "LastModifiedById" });
defineConstant("CREATED_BY",
    { "FIELD_REF": "CreatedById" });
    
    


//Theme Assignment Related Metadata
defineConstant("THEME_ASSIGNMENT",
    { "OBJECT_NAME": "agf__ADM_Theme_Assignment__c" });
defineConstant("THEME",
    { "OBJECT_NAME": "agf__ADM_Theme__c", "FIELD_REF": "agf__Theme__c" });

defineConstant("USER",
    { "OBJECT_NAME": "User" });


//Need to merge WORK_STATUS_OPEN_SF and WORK_STATUS_OPEN_DB in future
defineConstant("WORK_STATUS_OPEN_SF", ['\'New\'', '\'Acknowledged\'', '\'Triaged\'', '\'In Progress\''
    , '\'Investigating\'', '\'Ready for Review\'', '\'Fixed\'', '\'QA In Progress\'', '\'Waiting\'', '\'Pending Release\''
    , '\'More Info Required from Support\'']);

//Need to merge WORK_STATUS_OPEN_SF and WORK_STATUS_OPEN_DB in future
defineConstant("WORK_STATUS_OPEN_DB", ['New', 'Acknowledged', 'Triaged', 'In Progress'
, 'Investigating', 'Ready for Review', 'Fixed', 'QA In Progress', 'Waiting', 'Pending Release'
, 'More Info Required from Support']);


defineConstant("DB_FIELD_NAME", {
    "DB_VALUE": "db_value"
    , "SF_VALUE": "sf_value"
    , "SF_FIELD_REF": "SF_Field_Ref"
    , "OBJECT_VALUE": "Object_Value"
    , "SF_ID": "SF_ID"
});

defineConstant("DEFAULT_VALUES", {
    "IMPACT": "Performance"
    , "FREQUENCY": "Often"
    , "RECORD_TYPE": "Soleil Perf Framework Bug"
    , "EPIC": "P1"
    , "PRIORITY": "P1"
});


defineConstant("SF_RECORD_MAPPING","sf_record_mapping");
defineConstant("SF_WORK","sf_work");
defineConstant("SF_WORK_HISTORY","sf_work_history");


