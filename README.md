# Monitoring Overview

This is a node training projet, its purpose is to monitor system metrics and serve them in a REST API format.
The project monitors CPU usage, HDD memory usage and Database statistics. 
Every 5 seconds, it inserts the data in a Postgres database. 
Various routes documented below allows user to fetch data. 

Further functionalities are pending implementation. 

# Setup

Once the folder is cloned, run npm install on the project root folder to get all dependency modules. 
Run npm start at the root project folder to launch the start script. 
Server will run at localhost:8060.

# Routes

'/' : Homepage, with its documentation.

'/osjson' : All osmetrics records in the osmodel table. Rest API.

'/ramjson' : All rammetrics records in the osmodel table. Rest API.

'/osjson/(X)' : Select the oldest X amount of osmetrics records in the osmodel table from the database.

'/osjson/latest/(X)' : Select the newest X amount of osmetrics records in the osmodel table from the database.

'/osjson/cpuusage/(Y)' : Select all osmetrics records where cpu usage was higher than Y.

'/osjson/date/(Startdate)/(Enddate)' : Select all osmetrics record created within the startDate and EndDate.
Note: Please enter date in the YYYY-MM-DD format, also specifiying the time is possible. Do not use '/' in the params . 

'/dbjson': get all collections Names and Sizes from DB

'/dbjson/model' Get Table Index % usage and Rows count

'/osdata/delete': Drops all record from the osModel table.
Note: this is a DELETE request, not accessible by browser. Please use Postman or a similar tool.

'/osdata/splice': Request body must have a 'cutoff' or 'targetUsage' key, its value will be used as cutoff or targetUsage. 
Note: this is a PUT request, not accessible by browser. Please use Postman or a similar tool.
This will splice the oldest X records in the database, where X = cutoff OR it will splice records where Cpu usage was lower than targetUsage. The body data must be sent as x-www-form-urlencoded format.

'/osdata/splice/ids': Initially this route was to demonstrate rest parameters potency in js functions, but the put request is cast as a string in most used-case, so this route now splice any numbers of ids
supplied provided it respects the following format:
Request body must have a 'ids' key, its values will be used as record ids to remove from the osmetrics table. There must be a comma between IDS, any space will be ignored.
Note: this is a PUT request, not accessible by browser. Please use Postman or a similar tool.
Example of valid request: 
ids: 614
ids: 614,624 
ids: 614,624,669,679 (etc ... input as many IDs as you wish provided there is a comma separating the ids)



