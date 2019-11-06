# Monitoring Overview

This is a node training projet who's purpose is to monitor system metrics and serve them in a REST API format.
The project monitors CPU usage and HDD memory usage. 
Every 5 seconds, it inserts the data in a Postgres database. 
Various routes documented below allows user to fetch data. 

Further functionalities are pending implementation. 

# Setup

Once the folder is cloned, run npm install on the project root folder to get all dependency modules. 
Run npm start at the root project folder to launch the start script. 
Server will run at localhost:8060.

# Routes

'/' : Homepage, with its documentation.

'/osjson/(X)' : Select the latest X amount of osmetrics records in the osmodel table from the database.

'/osjson/cpuusage/(Y)' : Select all osmetrics records where cpu usage was higher than Y.

'/osjson/date/(Startdate)/(Enddate)' : Select all osmetrics record created within the startDate and EndDate.
Note: Please enter date in the YYYY-MM-DD format, also specifiying the time is possible. Do not use '/' in the params . 

'/osdata/delete': Drops all record from the osModel table.
Note: this is a PUT request, not accessible by browser. Please use Postman or a similar tool.