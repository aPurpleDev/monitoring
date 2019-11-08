const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const apiMethods = require('../api/osmetrics');
const dbMethods = require('../api/dbhandler');
const dbMonitor = require('../api/dbmetrics');
const snmpMethods = require('../api/snmphandler');

const path = require('path');

const favicon = require('serve-favicon');

const chalk = require('chalk');

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs'); //EJS handles the homepage '/', which is essentially a front documentation with 4 buttons to access the simplest routes

app.use(favicon(path.join(__dirname, 'favicon', 'softialogo.ico')));

setInterval(() => apiMethods.getOsMetrics(), 5000);//At server initialization, initialize DB and starts collecting osmetrics, then inserts them in the osmetrics table every 5 seconds

try{ //if SNMP doesn't work on the machine, these methods will error
setInterval( () => snmpMethods.getTotalRam(), 5000 ); //captures total Ram every 5 seconds and insert them into database
}catch(error){
    console.log(error.message);
}

app.get('/', (request, response) => {
    response.render('index.ejs');
});

app.get('/oslog', (request, response) => { //Route that selects all osmetrics records
    response.render('index.ejs');
    apiMethods.selectOsMetrics();
});

app.get('/osjson', (request, response) => { //Route that select all osmetrics records and serves them in a REST API format (JSON)
    apiMethods.selectOsJSON().then(data => {
        response.json(data);
    }).catch(e => console.log(e));
});

app.get('/osjson/:delimiter', (request, response) => { //Route that returns X most recent records of the osmetrics table, where X = delimeter param of the route.
    apiMethods.selectOsMetrics(request.params.delimiter)
        .then(data => response.json(data))
        .catch((error) => console.log(chalk.red("Error in API OS/Delimeter")));
});

app.get('/osjson/cpuusage/:cutoff', (request, response) => { //Route that returns records where cpuUsage was higher or equal than X, where X = cutoff param of the route.
    apiMethods.findUsageAbove(request.params.cutoff)
        .then(data => response.json(data))
        .catch((error) => console.log(chalk.red("Error in API CPU/cutoff")));
});

app.get('/osjson/date/:startdate/:enddate', (request, response) => { //Route that returns records created in between startdate and enddate, which are params of the route. YYYY-MM-DD format recommended.
    apiMethods.getOsByDates(request.params.startdate, request.params.enddate)
        .then(data => response.json(data))
        .catch((error) => console.log(chalk.red("Error in API OS/ByDate")));
});

app.delete('/osdata/delete', (request, response) => { //Route that deletes all records from the osmetrics table, must be sent via DELETE
    response.send({type: 'DELETE', message: 'Deletion of OS Data Table'});
    dbMethods.wipeOsTable().then(console.log(chalk.red('DELETE request received')));
});

app.put('/osdata/splice', (request, response) => { //Route that deletes X oldest records from the osmetrics table, where X = value of the 'cutoff' key from the request's body
    if (request.body.hasOwnProperty('cutoff')) {
        let cutoff = request.body.cutoff;
        dbMethods.removeOsMetrics(cutoff);
        response.json({'message': `Successfully deleted the ${cutoff} oldest records of osmetrics table`});
    } else {
        response.send(`No cutoff found, add a "cutoff" key to your request body. Cutoff must be a number`);
    }
});

app.get('/dbjson', (request, response) => { //Route that selects all collection names and sizes within the database
    dbMonitor.getDBSizes().then((data) => response.json(data))
        .catch((error) => console.log(chalk.redBright(error.message)));
});

app.get('/dbjson/model', (request, response) => { //Route that selects the osmetrics table index % usage and its rows count
    dbMonitor.getModelMetrics().then((data) => response.json(data))
        .catch((error) => console.log(chalk.redBright(error.message)));
});

app.get('/userlogs', (request, response) => { //Route that selects all records of user connection in the database
    dbMonitor.getUserConnections().then((data) => response.json(data))
        .catch((error) => console.log(chalk.redBright(error.message)));
});

const server = app.listen(8060);

