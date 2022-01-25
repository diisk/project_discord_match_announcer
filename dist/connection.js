"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToString = void 0;
const mysql_1 = __importDefault(require("mysql"));
var mysqlConfig = {
    host: "localhost",
    user: "root",
    password: "password",
    database: "dbname"
};
try {
    mysqlConfig = require('../mysql_config.json');
}
catch (err) {
    console.log(err);
    const fs = require("fs");
    fs.writeFileSync("./mysql_config.json", JSON.stringify(mysqlConfig, null, 2));
}
var connection = mysql_1.default.createConnection({
    host: mysqlConfig.host,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database
});
connection.connect(function (err) {
    if (err)
        throw err;
    console.log('mysql connected!');
});
function doTransaction(transaction, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connection.query("START TRANSACTION");
        let err = null;
        try {
            yield transaction();
            yield connection.query("COMMIT");
        }
        catch (error) {
            yield connection.query("ROLLBACK");
            err = error;
        }
        if (callback) {
            return callback(err);
        }
        return err;
    });
}
function dateToString(date) {
    if (date !== undefined) {
        const localeString = date.toLocaleString();
        return `${localeString.substring(6, 10)}-${localeString.substring(3, 5)}-${localeString.substring(0, 2)} ${localeString.substring(11, 19)}`;
    }
    return "";
}
exports.dateToString = dateToString;
function runQuery(query, values, callback) {
    /*>*if(values){
        console.log(mysql.format(query,values));
        console.log(values);
    }//*/
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        yield connection.query(query, values, (err, result, fields) => {
            if (callback)
                return callback(result, err);
            return resolve(result);
        });
    }));
}
function closeCon() {
    connection.end();
}
exports.default = {
    doTransaction,
    runQuery,
    closeCon
};
//# sourceMappingURL=connection.js.map