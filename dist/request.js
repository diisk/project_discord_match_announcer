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
Object.defineProperty(exports, "__esModule", { value: true });
exports.api_key = exports.request = void 0;
const config_json_1 = require("./config.json");
Object.defineProperty(exports, "api_key", { enumerable: true, get: function () { return config_json_1.api_key; } });
const utils_1 = require("./utils");
const fetch = require('node-fetch');
var requestCounter = 0;
var requestStartDate;
var requestEndDate;
function request(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (requestEndDate && (0, utils_1.compareDates)(new Date(), requestEndDate) >= 0) {
            requestStartDate = null;
            console.log(`END: ${requestEndDate.toLocaleString()} NOW: ${new Date().toLocaleString()}`);
        }
        else if (requestEndDate && requestCounter >= 98) {
            requestStartDate = null;
            const waittime = (0, utils_1.timeBetweenDates)(requestEndDate, new Date());
            console.log(`ENDDATE: ${requestEndDate.toLocaleString()} NOW: ${new Date().toLocaleString()} WAITTIME:${waittime}`);
            yield (0, utils_1.sleep)(waittime);
            console.log(`CONTINUE: ${new Date().toLocaleString()}`);
        }
        try {
            const response = yield fetch(url);
            if (!requestStartDate) {
                requestStartDate = new Date();
                requestEndDate = new Date(requestStartDate.getTime() + (2 * 60 * 1000));
                requestCounter = 0;
            }
            requestCounter++;
            yield (0, utils_1.sleep)(51);
            return yield response.json();
        }
        catch (err) {
            console.log(err);
        }
        return null;
    });
}
exports.request = request;
//# sourceMappingURL=request.js.map