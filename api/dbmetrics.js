const dbMethods = require('../api/dbhandler');

const getDBSizes = async () => { //Select database sizes from Postgres statistics table
    let db_JSONlogs = {"success": true, "message": `records of DB Sizes metrics within DB URL Params`};
    const dbLogs = [];
    const dbSizes = await dbMethods.sequelize.query(`select datname, pg_size_pretty(pg_database_size(datname)) from pg_database order by pg_database_size(datname);`);

    for (let entry of dbSizes) {
        dbLogs.push(entry);
    }
    console.log("query statistics DB", JSON.stringify(dbLogs));
    db_JSONlogs.data = dbLogs[0];
    return db_JSONlogs;
};

const getModelMetrics = async () => { //Select the % of used index in the osmetrics table and its number of rows
    let db_JSONlogs = {"success": true, "message": `record of Model % of used index and number of rows`};
    const dbLogs = [];
    const dbSizes = await dbMethods.sequelize.query(`SELECT relname, 100 * idx_scan / (seq_scan + idx_scan) percent_of_times_index_used, n_live_tup rows_in_table FROM pg_stat_user_tables ORDER BY n_live_tup DESC;`);

    for (let entry of dbSizes) {
        dbLogs.push(entry);
    }
    console.log("Model metrics statistics db", JSON.stringify(dbLogs));
    db_JSONlogs.data = dbLogs[0];
    return db_JSONlogs;
};

const getUserConnections = async () => { //Select records of users who connected to the database
    let db_JSONlogs = {"success": true, "message": `record of User connections to the DB`};
    const dbLogs = [];
    const dbSizes = await dbMethods.sequelize.query(`select client_addr, usename, datname, count(*) from pg_stat_activity group by 1,2,3 order by 4 desc;`);
    for (let entry of dbSizes) {
        dbLogs.push(entry);
    }
    console.log("User connection stats", JSON.stringify(dbLogs));
    db_JSONlogs.data = dbLogs[0];
    return db_JSONlogs;
};

module.exports = {
    getDBSizes,
    getModelMetrics,
    getUserConnections
};