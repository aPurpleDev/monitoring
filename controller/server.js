const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');
const favicon = require('serve-favicon');

const chalk = require('chalk');

const apiMethods = require('../api/osmetrics');
const dbMethods = require('../api/dbhandler');
const dbMonitor = require('../api/dbmetrics');
const snmpMethods = require('../api/snmphandler');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.set('view engine', 'ejs'); //EJS handles the homepage '/', which is essentially a front documentation with 4 buttons to access the simplest routes
app.use(favicon(path.join(__dirname, 'favicon', 'softialogo.ico')));

dbMethods.initDB();

setInterval(() => apiMethods.getOsMetrics(), 5000); //At server initialization, initialize DB and starts collecting osmetrics, then inserts them in the osmetrics table

try{
setInterval(() => snmpMethods.getTotalRam(), 5000); //At server initialization, initialize DB and starts collecting osmetrics, then inserts them in the osmetrics table
}catch(error){
    console.log("Error appel de getTotalRam via SNMP: ", error.message);
}

app.get('/', (request, response) => { //Homepage, front with 5 buttons and a documentation
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

app.get('/ramjson', (request, response) => { //Route that select all rammetrics records and serves them in a REST API format (JSON)
    snmpMethods.selectRAMJSON().then(data => {
        response.json(data);
    }).catch(e => console.log(e));
});

app.get('/osjson/:delimiter', (request, response) => { //Route that returns X oldes records of the osmetrics table, where X = delimeter param of the route.
    apiMethods.selectOsMetrics(request.params.delimiter)
        .then(data => response.json(data))
        .catch((error) => console.log(chalk.red("Error in API OS/Delimeter")));
});

app.get('/osjson/latest/:delimiter', (request, response) => { //Route that returns X most recent records of the osmetrics table, where X = delimeter param of the route.
    apiMethods.selectLatestOsMetrics(request.params.delimiter)
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
                                                   //Can also delete X records where cpuUsage was lower than X
    if (request.body.hasOwnProperty('cutoff')) {
        let cutoff = request.body.cutoff;

        if (!Number.isNaN(parseInt(cutoff))) {

            dbMethods.removeOsMetrics(cutoff).catch((error) => console.log(error));
            response.json({'message': `Successfully deleted the ${parseInt(cutoff)} oldest records of osmetrics table`});
        } else {
            response.status(400);
            response.send({'Bad Request Error': `Enter an Interger number in cutoff value for the request to be processed. Input denied`});
        }
    } else if (request.body.hasOwnProperty('targetUsage')) {
        if (parseInt(request.body.targetUsage)) {
            dbMethods.removeOsMetricsWithDate(request.body.targetUsage).catch((error) => console.log(error));
            response.json({'message': `Successfully deleted records of cpu usage lower than ${parseInt(request.body.targetUsage)} in osmetrics table`});
        } else {
            response.status(400);
            response.send({'Bad Request Error': `targetUsage doesn't match acceptable format. Must be a number`});
        }
    } else {
        response.status(400);
        response.send({
            'Bad Request Error': `No cutoff found or targetDate found. 
        Add a "cutoff" or "targetDate" key to your request body for the server to process your request. 
        Cutoff must be a number and targetDate a parsable date format.`
        });
    }
});

app.put('/osdata/splice/ids', (request, response) => { //Route that deletes as many entry as IDs matching in the request body
    if (request.body.hasOwnProperty('ids')) {
        let ids = request.body.ids;
        try{
        dbMethods.removeByIds(ids);
        }catch(error)
        {
            console.log("Error on try/catch route splcie Ids:", chalk.redBright(error.message));
        }
        response.json({'message': `Successfully deleted ids submitted in request: ${ids.toString()}`});
    }else{
        response.status(400);
        response.send({'Bad Request Error': `Enter valid IDs seperated by a comma ',' for the request to be processed. Input denied`});
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

