const chalk = require('chalk');

const Sequelize = require('sequelize');

const DBURL = `postgres://postgres:postgres@192.168.10.107:5432/tp_supervision`;

const sequelize = new Sequelize(DBURL, {
   dialect : 'postgres',
    pool: {
       max: 5,
        min: 0,
        idle: 1
    }
});

const osModel = sequelize.define('osmetrics', {
    cpuUsage: {
        type: Sequelize.DECIMAL(10,2)
    },
    cpuFree: {
        type: Sequelize.DECIMAL(10,2)
    },
    freeMem: {
        type: Sequelize.DECIMAL(10,2)
    },
    usedMem: {
        type: Sequelize.DECIMAL(10,2)
    }
});

let isDBConnected = false;

const initDB = () => {

    if(isDBConnected === false)
    {
    console.log(chalk.red('Init DB Model if not there, this should appear only once'));
    osModel.sync().then(() => {
        console.log(chalk.blue(`OS Table Sync OK, this should appear only once`));
        isDBConnected = true;
    }).catch((error) => console.log(chalk.red(`Error syncing Model`, error.message)))

    console.log(chalk.red('Init DB sequalize.auth ..'));
    sequelize.authenticate().then( () => console.log(chalk.blue("connection to DB: OK")) ).catch( (error) => console.log(chalk.red(`Error connecting to DB`, error.message)) );
    }else{
        console.log(chalk.blue('DB singleton - bool true so DB connection remains unique'));
    }
};

const wipeOsTable = async() => {
    await osModel.destroy( {
        where: {},
        truncate: true
    } );
    console.log(chalk.green('Table OS wiped from wipeOsTable method'));
};

const removeOsMetrics = async (cutoff) => {
    await sequelize.query(`DELETE FROM osmetrics WHERE ctid IN (SELECT ctid FROM osmetrics ORDER BY id LIMIT ${cutoff});`);

    console.log(chalk.bgRedBright(`Deleted oldest ${cutoff} rows from osmetrics table`));
    return `Deleted oldest ${cutoff} rows from osmetrics table`;
};

module.exports.initDB = initDB;
module.exports.osModel = osModel;
module.exports.wipeOsTable = wipeOsTable;
module.exports.removeOsMetrics = removeOsMetrics;
module.exports.sequelize = sequelize;
