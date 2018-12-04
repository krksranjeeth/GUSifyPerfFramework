const db = require("../utils/db");
const sf = require("../utils/sf");
const constants = require("../utils/constants");
const express = require("express");
const router = express.Router();

let app = express();
let ejs = require('ejs');

async function getSFId(sfFieldRef, objectValue, sfObjectName) {

    return new Promise(function (resolve, reject) {
        db.getSFId(sfFieldRef, objectValue, sfid => {
            if (sfid == "") {
                console.log(`Retrieving SF Id for ${sfObjectName} from Salesforce`)
                sf.getSFId(sfObjectName, sfFieldRef, objectValue, sfid => {
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

router.get("/", async (req, res) => {
    console.log("List the work items with open status");
    db.listOpenWork(result => {
        console.log(req.query.format)
        if (req.query.format == undefined) {
            console.log("Format => HTML");
            res.render('../src/views/work.ejs',{result: result});
        } else {
            if (req.query.format.toLowerCase() == "json") {
                console.log("Format => JSON");
                res.send(JSON.stringify(result, undefined, '\t'));
            }
        }
    });

});

router.get("/:workId(W-[0-9]+)(:action(*))", async (req, res) => {
    if(req.params.action == undefined || req.params.action == "" || req.params.action == "/" ) {
            db.getWorkDetails(req.params.workId, (result => {
            res.send(result);
        }));
    } else if (req.params.action == "/history") {
        db.getWorkId(req.params.workId, result => {
            if (req.query.format != undefined && req.query.format.toLowerCase() == 'json') {
                res.send(JSON.stringify(result, undefined, '\t'));
            } else {
                res.send("UI list view for Work History")
            }
        })
    } else {
        res.statusCode = 404;
        res.send("Page Not found");
    }
});


router.post("/create", async (req, res) => {

    console.log("Creating work item in salesforce")

    let productTagValue = req.body.productTag;
    let scrumTeamValue = req.body.scrumTeam;

    let impactValue = req.body.impact;
    if (impactValue == '' || impactValue === undefined) {
        impactValue = [constants.DEFAULT_VALUE.IMPACT];
    }

    let frequencyValue = req.body.frequency;
    if (frequencyValue == '' || frequencyValue === undefined) {
        frequencyValue = [constants.DEFAULT_VALUE.FREQUENCY];
    }

    let recordTypeValue = req.body.recordType;
    if (recordTypeValue == '' || recordTypeValue === undefined) {
        recordTypeValue = [constants.DEFAULT_VALUE.RECORD_TYPE];
    }

    let themeValue = req.body.theme;
    let foundInBuildValue = req.body.foundInBuild;

    let scheduledBuildValue = req.body.scheduledBuild;
    if (scheduledBuildValue == '' || scheduledBuildValue === undefined) {
        scheduledBuildValue = foundInBuildValue;
    }

    let epicValue = req.body.epic;
    if (epicValue == '' || epicValue === undefined) {
        epicValue = [constants.DEFAULT_VALUE.EPIC];
    }

    let subjectValue = req.body.subject;
    let detailsValue = req.body.details;

    try {
        let [productTagId, scrumTeamId, impactId, frequencyId, themeId, foundInBuildId, scheduledBuildId, epicId, recordTypeId] = await Promise.all([
            sf.getSFId(constants.PRODUCT_TAG.FIELD_REF, productTagValue, constants.PRODUCT_TAG.OBJECT_NAME),
            sf.getSFId(constants.SCRUM_TEAM.FIELD_REF, scrumTeamValue, constants.SCRUM_TEAM.OBJECT_NAME),
            sf.getSFId(constants.IMPACT.FIELD_REF, impactValue, constants.IMPACT.OBJECT_NAME),
            sf.getSFId(constants.FREQUENCY.FIELD_REF, frequencyValue, constants.FREQUENCY.OBJECT_NAME),
            sf.getSFId(constants.THEME.FIELD_REF, themeValue, constants.THEME.OBJECT_NAME),
            sf.getSFId(constants.FOUND_IN_BUILD.FIELD_REF, foundInBuildValue, constants.FOUND_IN_BUILD.OBJECT_NAME),
            sf.getSFId(constants.SCHEDULED_BUILD.FIELD_REF, scheduledBuildValue, constants.SCHEDULED_BUILD.OBJECT_NAME),
            sf.getSFId(constants.EPIC.FIELD_REF, epicValue, constants.EPIC.OBJECT_NAME),
            sf.getSFId(constants.RECORD_TYPE.FIELD_REF, recordTypeValue, constants.RECORD_TYPE.OBJECT_NAME),
        ]);

        let workData = {
            [constants.PRODUCT_TAG.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: productTagId, [constants.DB_FIELD_NAME.DB_VALUE]: productTagValue },
            [constants.SCRUM_TEAM.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: scrumTeamId, [constants.DB_FIELD_NAME.DB_VALUE]: scrumTeamValue },
            [constants.IMPACT.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: impactId, [constants.DB_FIELD_NAME.DB_VALUE]: impactValue },
            [constants.FREQUENCY.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: frequencyId, [constants.DB_FIELD_NAME.DB_VALUE]: frequencyValue },
            [constants.THEME.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: themeId, [constants.DB_FIELD_NAME.DB_VALUE]: themeValue },
            [constants.FOUND_IN_BUILD.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: foundInBuildId, [constants.DB_FIELD_NAME.DB_VALUE]: foundInBuildValue },
            [constants.SCHEDULED_BUILD.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: scheduledBuildId, [constants.DB_FIELD_NAME.DB_VALUE]: scheduledBuildValue },
            [constants.EPIC.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: epicId, [constants.DB_FIELD_NAME.DB_VALUE]: epicValue },
            [constants.SUBJECT.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: subjectValue, [constants.DB_FIELD_NAME.DB_VALUE]: subjectValue },
            [constants.DETAILS.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: detailsValue, [constants.DB_FIELD_NAME.DB_VALUE]: detailsValue },
            [constants.RECORD_TYPE.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: recordTypeId, [constants.DB_FIELD_NAME.DB_VALUE]: recordTypeValue }
        };

        //Create work record in salesforce
        sf.createWorkRecord(constants.WORK.OBJECT_NAME, workData, (workRecordId, workName) => {
            console.log("Created work with id - " + workRecordId);
            themeData = {
                [constants.WORK.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: workRecordId, [constants.DB_FIELD_NAME.DB_VALUE]: workName },
                [constants.THEME.FIELD_REF]: { [constants.DB_FIELD_NAME.SF_VALUE]: themeId, [constants.DB_FIELD_NAME.DB_VALUE]: themeValue }
            };
            //    Assigns theme to the newly created work in salesforce
            sf.createThemeRecord(constants.THEME_ASSIGNMENT.OBJECT_NAME, themeData, themeRecordId => {
                console.log("Completed theme assignment for work id - " + workRecordId + "with theme id - " + themeRecordId);
            })
            res.send("{ \"work_number\": \"" + workName +
                "\", \"salesforce_id\": \"" + workRecordId +
                "\" } ");
        });

    } catch (err) {
        console.error("Caught error " + err);
    }
});

router.get("/refresh", async (req, res) => {
    sf.refreshSFWorkData(() => {
        res.redirect('/work?format=json');
    });

});

module.exports = router;