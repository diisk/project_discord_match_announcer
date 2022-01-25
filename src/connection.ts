import mysql from "mysql";
var mysqlConfig = {
    host: "localhost",
    user: "root",
    password: "password",
    database: "dbname"
};

try {
    mysqlConfig = require('../mysql_config.json');
} catch (err) {
    console.log(err);
    const fs = require("fs");
    fs.writeFileSync("./mysql_config.json", JSON.stringify(mysqlConfig, null, 2));
}

var connection = mysql.createConnection({
    host: mysqlConfig.host,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database
});

connection.connect(function (err: any) {
    if (err) throw err;
    console.log('mysql connected!');
});

async function doTransaction(transaction: () => void, callback?: (err: any) => void) {
    await connection.query("START TRANSACTION");
    let err = null;
    try {
        await transaction();
        await connection.query("COMMIT");
    } catch (error) {
        await connection.query("ROLLBACK");
        err = error;
    }
    if (callback) {
        return callback(err);
    }
    return err;
}

function dateToString(date?: Date): string {
    if (date !== undefined) {
        const localeString = date.toLocaleString();
        return `${localeString.substring(6, 10)}-${localeString.substring(3, 5)}-${localeString.substring(0, 2)} ${localeString.substring(11, 19)}`;
    }
    return "";
}

function runQuery(query: string, values?: any[], callback?: (result: any, error: any) => void) {
    /*>*if(values){
        console.log(mysql.format(query,values));
        console.log(values);
    }//*/
    
    return new Promise(async (resolve, reject) => {
        await connection.query(query, values, (err, result, fields) => {
            if(callback) return callback(result,err);
            return resolve(result);
        });
    });
}

function closeCon(){
    connection.end();
}

export default {
    doTransaction,
    runQuery,
    closeCon
};  

export {dateToString}