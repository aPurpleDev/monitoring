const osutils = require('os-utils');
const chalk = require('chalk');
const osu = require('node-os-utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cpu = osu.cpu;

const dbMethods = require('../api/dbhandler');

const getOsMetrics = async () => { //get OS metrics of client and sends to controller

    dbMethods.initDB();

    const metrics = {};

    await cpu.usage().then((data) => {
        console.log(chalk.blueBright(`Current CPU Used : ${data}%`));
        metrics.cpuUsage = data.toFixed(2);
        console.log(chalk.greenBright(`Current CPU Free : ${100 - data}%`));
        metrics.cpuFree = (100 - data).toFixed(2);
    }).catch(error => console.log(chalk.red('Erreur de promesse: cpu usage')));

    console.log(chalk.blueBright(`Current Memory Used : ${100 - (osutils.freememPercentage() * 100)}%`));
    console.log(chalk.greenBright(`Current Free Memory : ${osutils.freememPercentage() * 100}%`));

    metrics.freememPercentage = (osutils.freememPercentage() * 100).toFixed(2);
    metrics.usedmemPercentage = (100 - (osutils.freememPercentage() * 100)).toFixed(2);

    console.log(chalk.yellow("Objet PCPM final: "));
    console.log(metrics);

    console.log(chalk.bgBlueBright('Inserting metrics in DB'));
    dbMethods.osModel.create({
        cpuUsage: metrics.cpuUsage,
        cpuFree: metrics.cpuFree,
        freeMem: metrics.freememPercentage,
        usedMem: metrics.usedmemPercentage
    });

    module.exports.metrics = metrics;
};

const selectOsMetrics = async (limiter) => {
    const data = await dbMethods.osModel.findAll({limit: limiter, raw: true});

    let os_JSONlogs = { "success":true , "message":`last ${limiter} logs in database` };
    let arrayLogs = [];

    for(let entry of data)
    {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

const selectOsJSON = async () => {
    let os_JSONlogs = { "success":true , "message":"all os logs in database" };
    let arrayLogs = [];

    const data = await dbMethods.osModel.findAll( {raw : true, order: [['id', 'DESC']]} );

    for(let entry of data)
    {
        arrayLogs.push(entry);
    }
    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

const findUsageAbove = async (cutoff) => { //actually returns value Equal OR Above
    let os_JSONlogs = { "success":true , "message":`record of CPU with usage equal or higher than ${cutoff}`};
    let arrayLogs = [];

    const data = await dbMethods.osModel.findAll( {raw : true, order: [['id', 'DESC']], where: { cpuUsage: { [Op.gte]: cutoff} }} );

    for(let entry of data){
        arrayLogs.push(entry);
    }

    os_JSONlogs.data = arrayLogs;

    return os_JSONlogs;
};

module.exports.getOsMetrics = getOsMetrics;
module.exports.selectOsMetrics = selectOsMetrics;
module.exports.selectOsJSON = selectOsJSON;
module.exports.findUsageAbove = findUsageAbove;


