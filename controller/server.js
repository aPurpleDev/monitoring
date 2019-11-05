const express = require('express');
const apiMethods = require('../api/osmetrics');
const app = express();

app.set('view engine', 'ejs');
setInterval(() =>  apiMethods.getOsMetrics(), 5000);

app.get('/', (request, response) => { //Placeholder view
    response.render('index.ejs');

    response.end('test of backend - end');
});

app.get('/oslog', (request, response) => { //Sends a query to findAll last 5 osmetrics entry in database
    response.render('index.ejs');

    apiMethods.selectOsMetrics();

    response.end('oslog route - end');
});

app.get('/osjson', (request, response) => { //Should return JSON logs in REST API format

    apiMethods.selectOsJSON().then( data => {
        response.json(data);
    }).catch( e => console.log(e));

});

const server = app.listen(8060);

