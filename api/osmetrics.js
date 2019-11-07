const osutils = require('os-utils');
const chalk = require('chalk');
const osu = require('node-os-utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cpu = osu.cpu;

const dbMethods = require('../api/dbhandler');

const getOsMetrics = async () => { //Called upon server starts. Initialize the DB if not online(Singleton). Collects OS metrics from computer and inserts them in the table
    dbMethods.initDB();

    const metrics = {}; //Stores OS metrics for upcoming insert

    await cpu.usage().then((data) => {
        metrics.cpuUsage = data.toFixed(2);
        metrics.cpuFree = (100 - data).toFixed(2);
    }).catch(error => console.log(chalk.red('Erreur de promesse: cpu usage')));

    metrics.freememPercentage = (osutils.freememPercentage() * 100).toFixed(2);
    metrics.usedmemPercentage = (100 - (osutils.freememPercentage() * 100)).toFixed(2);

    dbMethods.osModel.create({
        cpuUsage: metrics.cpuUsage,
        cpuFree: metrics.cpuFree,
        freeMem: metrics.freememPercentage,
        usedMem: metrics.usedmemPercentage
    });
    module.exports.metrics = metrics;
};

const selectOsMetrics = async (limiter) => { //Select latest X records of osmetrics, where X == limiter
    const data = await dbMethods.osModel.findAll({limit: limiter, raw: true});
    let os_JSONlogs = {"success": true, "message": `Last ${limiter} records in database`};
    let arrayLogs = [];

    for (let entry of data) {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

const selectOsJSON = async () => { //Select all osmetrics records in database
    let os_JSONlogs = {"success": true, "message": "all OS records in database"};
    let arrayLogs = [];
    const data = await dbMethods.osModel.findAll({raw: true, order: [['id', 'DESC']]});

    for (let entry of data) {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

const findUsageAbove = async (cutoff) => { //Select records where CPU usage was higher or equal than cutoff
    let os_JSONlogs = {"success": true, "message": `records of CPU usage equal or higher than ${cutoff}`};
    let arrayLogs = [];

    const data = await dbMethods.osModel.findAll({
        raw: true,
        order: [['id', 'DESC']],
        where: {cpuUsage: {[Op.gte]: cutoff}}
    });

    for (let entry of data) {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

const getOsByDates = async (startDate, endDate) => { //Select records that were created inclusively in between (attribute createdAt) startDate and enddate
    let jsStartDate = new Date(startDate);
    let jsEndDate = new Date(endDate);
    let os_JSONlogs = {"success": true, "message": `records of OS metrics within ${jsStartDate} and ${jsEndDate}`};
    let arrayLogs = [];

    const data = await dbMethods.osModel.findAll({
        raw: true,
        order: [['id', 'DESC']],
        where: {createdAt: {[Op.between]: [jsStartDate, jsEndDate]}}
    });

    for (let entry of data) {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

module.exports.getOsMetrics = getOsMetrics;
module.exports.selectOsMetrics = selectOsMetrics;
module.exports.selectOsJSON = selectOsJSON;
module.exports.findUsageAbove = findUsageAbove;
module.exports.getOsByDates = getOsByDates;

