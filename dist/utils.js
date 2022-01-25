"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeToString = exports.randomString = exports.timeBetweenDates = exports.compareDates = exports.shuffleArray = exports.LoopFunction = exports.sleep = exports.chance = exports.randomNumber = void 0;
class LoopFunction {
    constructor(func, miliseconds) {
        this.interval = null;
        this.func = func;
        this.miliseconds = miliseconds;
    }
    isRunning() {
        if (this.interval) {
            return true;
        }
        return false;
    }
    start() {
        if (this.isRunning())
            throw "Already running this instance.";
        this.interval = setInterval(this.func, this.miliseconds);
    }
    stop() {
        if (!this.isRunning())
            throw "Already stopped this instance.";
        if (this.interval) {
            clearInterval(this.interval);
            this.interval.unref();
            this.interval = null;
        }
    }
    static createLoop(func, miliseconds) {
        return new LoopFunction(func, miliseconds);
    }
}
exports.LoopFunction = LoopFunction;
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
exports.shuffleArray = shuffleArray;
function randomNumber(maxRange, minRange = 0) {
    return minRange + (Math.floor(Math.random() * (maxRange - minRange)));
}
exports.randomNumber = randomNumber;
function chance(percent) {
    return percent < Math.random();
}
exports.chance = chance;
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
exports.sleep = sleep;
/**
 *
 * - Return 1 when date1 is older then date2
 *
 * - Return -1 when date1 is newest then date2
 *
 * - Return 0 when date1 is same than date2
 *
 */
function compareDates(date1, date2, compareTime = true) {
    let mod = date1.getFullYear() - date2.getFullYear();
    if (mod == 0) {
        mod = date1.getMonth() - date2.getMonth();
        if (mod == 0) {
            mod = date1.getDay() - date2.getDay();
            if (mod == 0 && compareTime) {
                mod = date1.getHours() - date2.getHours();
                if (mod == 0) {
                    mod = date1.getMinutes() - date2.getMinutes();
                    if (mod == 0) {
                        mod = date1.getSeconds() - date2.getSeconds();
                        if (mod == 0) {
                            mod = date1.getMilliseconds() - date2.getMilliseconds();
                        }
                    }
                }
            }
        }
    }
    return mod == 0 ? mod : (mod > 0 ? 1 : -1);
}
exports.compareDates = compareDates;
function timeBetweenDates(endDate, startDate) {
    return Math.floor(endDate.getTime() - startDate.getTime());
}
exports.timeBetweenDates = timeBetweenDates;
function randomString(length) {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let random = "";
    for (let i = 0; i < length; i++) {
        random += alpha.charAt(randomNumber(alpha.length));
    }
    return random;
}
exports.randomString = randomString;
//CASO PRECISA, TESTAR AINDA
function normalizeToString(str) {
    return str.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
}
exports.normalizeToString = normalizeToString;
//# sourceMappingURL=utils.js.map