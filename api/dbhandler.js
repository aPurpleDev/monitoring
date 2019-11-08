const chalk = require('chalk');

const Sequelize = require('sequelize');
const DBURL = `postgres://postgres:postgres@192.168.10.107:5432/tp_supervision`;
let isDBConnected = false;

const sequelize = new Sequelize(DBURL, {
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 1
    }
});

const osModel = sequelize.define('osmetrics', { //osmetrics table model
    cpuUsage: {
        type: Sequelize.DECIMAL(10, 2)
    },
    cpuFree: {
        type: Sequelize.DECIMAL(10, 2)
    },
    freeMem: {
        type: Sequelize.DECIMAL(10, 2)
    },
    usedMem: {
        type: Sequelize.DECIMAL(10, 2)
    }
});

const ramModel = sequelize.define('rammetrics', {
    TotalRAM: {
        type: Sequelize.BIGINT
    },
    FreeRAM: {
        type: Sequelize.BIGINT
    }
});

const initDB = () => { //initializes DB connection. Singleton
    if (isDBConnected === false) {
        console.log(chalk.red('Init DB Model if not there, this should appear only once'));
        osModel.sync().then(() => {
            console.log(chalk.blue(`OS Table Sync OK, this should appear only once`));
            isDBConnected = true;
        }).catch((error) => console.log(chalk.red(`Error syncing OS Model`, error.message)));
        ramModel.sync().then(() => {
            console.log(chalk.blue(`RAM Table Sync OK, this should appear only once`));
            isDBConnected = true;
        }).catch((error) => console.log(chalk.red(`Error syncing RAM Model`, error.message)));

        console.log(chalk.red('Init DB sequalize.auth ..'));
        sequelize.authenticate().then(() => console.log(chalk.blue("connection to DB: OK"))).catch((error) => console.log(chalk.red(`Error connecting to DB`, error.message)));
    } else {
        console.log(chalk.blue('DB singleton - bool true so DB connection remains unique'));
    }
};

const wipeOsTable = async () => { //Deletes all records from osmetrics table
    await osModel.destroy({
        where: {},
        truncate: true
    });
    console.log(chalk.green('Table OS wiped from wipeOsTable method'));
};

const removeOsMetrics = async (cutoff) => { //Deletes oldest X records from the osmetrics table, where X = cutoff.
    await sequelize.query(`DELETE FROM osmetrics WHERE ctid IN (SELECT ctid FROM osmetrics ORDER BY id LIMIT :cutoff);`, { replacements: {cutoff: parseInt(cutoff)}, type: sequelize.QueryTypes.SELECT } );

    console.log(chalk.bgRedBright(`Deleted oldest ${parseInt(+cutoff)} rows from osmetrics table`));
    return `Deleted oldest ${parseInt(cutoff)} rows from osmetrics table`;
};

module.exports = {
  initDB,
  osModel,
  ramModel,
  wipeOsTable,
  removeOsMetrics,
  sequelize
};