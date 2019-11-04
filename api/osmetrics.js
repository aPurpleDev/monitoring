const osutils = require('os-utils');
const chalk = require('chalk');

const getOsMetrics = () => { //get OS metrics of client and sends to controller

    let metrics = {
    };

    osutils.cpuUsage( (data) => {
        console.log(chalk.green(`Current CPU Usage : ${data * 100} %`));
        metrics.cpuUsage = data * 100;
    });

    osutils.cpuFree( (data) => {
        console.log(chalk.green(`Current CPU Free : ${data * 100} %`));
        metrics.cpuFree = data * 100;
    });

    console.log(chalk.green(`Current Free Memory : ${osutils.freememPercentage() * 100} %`));
    metrics.freememPercentage = `Current Free Memory : ${osutils.freememPercentage() * 100} %`;

    console.log(chalk.green(`Current Memory Used : ${100 - (osutils.freememPercentage() * 100)}`));
    metrics.usedmemPercentage = `Current Memory Used : ${100 - (osutils.freememPercentage() * 100)}`;

    console.log(metrics);
    setInterval(getOsMetrics,5000); //toutes les 5 secondes
};

module.exports.getOsMetrics = getOsMetrics();


