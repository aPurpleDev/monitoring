const chalk = require('chalk');
const snmp = require('snmp-native');

const session = new snmp.Session({ host: 'localhost', port: 8060 });

session.get({oid:[1,3,6,1,2,1,25,2,3,1], community: 'public'}, (error, variables) => { //not working, possibly because snmpwalk is not available on this OS
    if(error){
        console.log(chalk.red('Error fetching OID variables'), error.message);
    }else{
        console.log(chalk.greenBright(`${variables[0].oid} = ${variables[0].value} (et de type ${variables[0].type})`));
    }
});

