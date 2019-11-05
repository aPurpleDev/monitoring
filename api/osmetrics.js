const osutils = require('os-utils');
const chalk = require('chalk');

const osu = require('node-os-utils');
const cpu = osu.cpu

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

const selectOsMetrics = () => {
    dbMethods.osModel.findAll({limit: 5, raw: true}).then( (data) => console.log(chalk.yellow("Select method"),data));
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

module.exports.getOsMetrics = getOsMetrics;
module.exports.selectOsMetrics = selectOsMetrics;
module.exports.selectOsJSON = selectOsJSON;



