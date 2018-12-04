const EventEmitter = require("events");

class SFEventEmitter extends EventEmitter {
    storeSFMappingInDB(data) {
        console.log("Received emitter event to store salesforce mapping details in DB");
        sfEventEmitter.emit('storeSFMappingInDB', data);
    }

    storeSFWorkInDB(data) {
        console.log("Received emitter event to store salesforce work data in DB");
        sfEventEmitter.emit('storeSFWorkInDB', data);
    }
}

module.exports = SFEventEmitter;