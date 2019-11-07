const express = require('express');
const apiMethods = require('../api/osmetrics');
const dbMethods = require('../api/dbhandler');
const dbMonitor = require('../api/dbmetrics');
const app = express();
const path = require('path');
const favicon = require('serve-favicon');
const chalk = require('chalk');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname,'favicon','softialogo.ico')));
setInterval(() =>  apiMethods.getOsMetrics(), 5000);

app.get('/', (request, response) => { //Placeholder view
    response.render('index.ejs');

    response.end('test of backend - end');
});

app.get('/oslog', (request, response) => { //Replaced by API route for now.. maybe worth removing
    response.render('index.ejs');

    apiMethods.selectOsMetrics();

    response.end('oslog route - end');
});

app.get('/osjson', (request, response) => { //Returns ALL JSON logs in REST API format

    apiMethods.selectOsJSON().then( data => {
        response.json(data);
    }).catch( e => console.log(e));

});

app.get('/osjson/:delimiter', (request, response) => { //Only returns the number of records specified in the delimiter param of the route
    apiMethods.selectOsMetrics(request.params.delimiter)
        .then( data => response.json(data) )
        .catch( (error) => console.log(chalk.red("Error in API OS/Delimeter")) );
});

app.get('/osjson/cpuusage/:cutoff', (request, response) => {
    apiMethods.findUsageAbove(request.params.cutoff)
        .then( data => response.json(data))
        .catch( (error) => console.log(chalk.red("Error in API CPU/cutoff")) );
});

app.get('/osjson/date/:startdate/:enddate', (request, response) => { //Returns OS records between date params
                                                                //Converts YYYY-MM-DD to JS date before executing query, example: osjson/date/2019-11-01/2019-11-19
    apiMethods.getOsByDates(request.params.startdate, request.params.enddate)
        .then( data => response.json(data) )
        .catch( (error) => console.log(chalk.red("Error in API OS/ByDate")) );
});

app.delete('/osdata/delete', (request,response) => {
    response.send({type : 'DELETE', message : 'Deletion of OS Data Table'});
    dbMethods.wipeOsTable().then(console.log(chalk.red('DELETE request received')));
});

app.put('/osdata/splice', (request, response) => {
    console.log("request received from POSTMAN", request.body);
    if(request.body.hasOwnProperty('cutoff')){
        let cutoff = request.body.cutoff;
        dbMethods.removeOsMetrics(cutoff);
        console.log(chalk.blueBright(`PUT request deleting oldest ${cutoff} records of osmetrics table`));
        response.json({'message': `Successfully deleted the ${cutoff} oldest records of osmetrics table`});
    }else{
        console.log(request.body);
        response.send(`No cutoff found, add a "cutoff" key to your request body. Cutoff must be a number`);
    }
});


app.get('/dbjson', (request, response) => {
    dbMonitor.getDBSizes().
    then( (data) => response.json(data) )
        .catch( (error) => console.log(chalk.redBright(error.message)));
});

app.get('/dbjson/model', (request, response) => {
    dbMonitor.getModelMetrics().
    then( (data) => response.json(data) )
        .catch( (error) => console.log(chalk.redBright(error.message)));
});

app.get('/userlogs', (request, response) => {
    dbMonitor.getUserConnections().
    then( (data) => response.json(data) )
        .catch( (error) => console.log(chalk.redBright(error.message)));
});

const server = app.listen(8060);

