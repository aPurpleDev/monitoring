const express = require('express');
const apiMethods = require('../api/osmetrics');
const dbMethods = require('../api/dbhandler');
const app = express();
const chalk = require('chalk');

app.set('view engine', 'ejs');
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

app.put('/osdata/delete', (request,response) => {
    response.send({type : 'PUT', message : 'Deletion of OS Data Table'});
    dbMethods.wipeOsTable().then(response.redirect('/'));
});

const server = app.listen(8060);

