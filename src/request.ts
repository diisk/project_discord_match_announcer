import {api_key} from "./config.json";
import { sleep, timeBetweenDates, compareDates } from "./utils";

const fetch = require('node-fetch');

var requestCounter = 0;
var requestStartDate: any;
var requestEndDate: any;

async function request(url: string) {
    if (requestEndDate && compareDates(new Date(), requestEndDate) >= 0) {
        requestStartDate = null;
        console.log(`END: ${(requestEndDate as Date).toLocaleString()} NOW: ${new Date().toLocaleString()}`);
    } else if (requestEndDate && requestCounter >= 98) {
        requestStartDate = null;
        const waittime = timeBetweenDates(requestEndDate, new Date());
        console.log(`ENDDATE: ${(requestEndDate as Date).toLocaleString()} NOW: ${new Date().toLocaleString()} WAITTIME:${waittime}`);
        await sleep(waittime);
        console.log(`CONTINUE: ${new Date().toLocaleString()}`);
    }
    try {
        const response = await fetch(url);
        if (!requestStartDate) {
            requestStartDate = new Date();
            requestEndDate = new Date(requestStartDate.getTime() + (2 * 60 * 1000));
            requestCounter = 0;
        }
        requestCounter++;
        await sleep(51);
        return await response.json();
    } catch (err) {
        console.log(err);
    }
    return null;
}

export {request,api_key};