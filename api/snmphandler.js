const chalk = require('chalk');
const dbMethods = require('../api/dbhandler');

const snmp = require('net-snmp');
const session = snmp.createSession('192.168.10.148', 'public');
const oids = ['1.3.6.1.2.1.25.2.2.0'];

const getTotalRam = () => {
    let totalRam;

    session.get(oids, (error, varbinds) => {
        if(error){
            console.log(chalk.red('error snmp'),error.message);
        }else{
            for( let i = 0; i < varbinds.length; i++){
                if(snmp.isVarbindError(varbinds[i])){
                    console.error(snmp.varbindError(varbinds[i]))
                }else {
                    console.log(varbinds[i].oid + ' = ' + varbinds[i].value);
                    totalRam = varbinds[i].value;
                }
            }
        }
        //find a way to close session clean
    });

    let freeRam;

    session.get(['1.3.6.1.4.1.2021.4.6.0'], (error, varbinds) => {
        if(error){
            console.log(chalk.red('error snmp free ram'),error.message);
        }else{
            for( let i = 0; i < varbinds.length; i++){
                if(snmp.isVarbindError(varbinds[i])){
                    console.error(snmp.varbindError(varbinds[i]))
                }else {
                    console.log(varbinds[i].oid + ' = ' + varbinds[i].value);
                    freeRam = varbinds[i].value;
                    dbMethods.ramModel.create({FreeRAM: freeRam,TotalRAM: totalRam});
                }
            }
        }
        //find a way to close session clean
    })
};

session.trap(snmp.TrapType.LinkDown, (error) => {
    if(error)
        console.error(error);
});

module.exports.getTotalRam = getTotalRam;