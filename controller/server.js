const express = require('express');

const apiMethods = require('../api/osmetrics');

const app = express();
const server = app.listen(8060);

app.get('/', (request, response) => { //récupérer déjà les metrics du client pour commencer
    response.writeHead(200);

    apiMethods.getOsMetrics();

    response.end('test of backend');
});

