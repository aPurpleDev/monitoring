const express = require('express');
const apiMethods = require('../api/osmetrics');
const app = express();

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
        .catch( (error) => console.log(chalk.red("Erreur dans l'API OS/Delimeter")) );
});

app.get('/osjson/cpuusage/:cutoff', (request, response) => {
    apiMethods.findUsageAbove(request.params.cutoff)
        .then( data => response.json(data))
        .catch( (error) => console.log(chalk.red('Erreur sur la fonction findUsageAbove')) );
});

const server = app.listen(8060);

