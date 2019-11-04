const Mongoose = require('mongoose');
const config = require('./config');

Mongoose.Promise = global.Promise;

const connectToDb = async () => {
    let dbHost = config.dbHost;
    let dbPort = config.dbPort;
    let dbName = config.dbName;
    try {
        await Mongoose.connect(`mongodb://adminUser:admin@${dbHost}:${dbPort}/${dbName}`, {useNewUrlParser: true});
        console.log('Connected to mongo!!!');
    }
    catch (err) {
        console.log('Could not connect to MongoDB');
    }
}

module.exports = connectToDb;