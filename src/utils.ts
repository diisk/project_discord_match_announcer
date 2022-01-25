type AnyVoidFunction = (...args: any) => void;
class LoopFunction {
    private func: AnyVoidFunction;
    private miliseconds: number;
    private interval: NodeJS.Timer | null = null;

    private constructor(func: AnyVoidFunction, miliseconds: number) {
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
        if (this.isRunning()) throw "Already running this instance.";
        this.interval = setInterval(this.func, this.miliseconds);
    }

    stop() {
        if (!this.isRunning()) throw "Already stopped this instance.";
        if (this.interval) {
            clearInterval(this.interval);
            this.interval.unref();
            this.interval = null;
        }
    }

    static createLoop(func: AnyVoidFunction, miliseconds: number) {
        return new LoopFunction(func, miliseconds);
    }
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomNumber(maxRange: number, minRange: number = 0) {
    return minRange + (Math.floor(Math.random() * (maxRange - minRange)));
}

function chance(percent: number) {
    return percent < Math.random();
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


/**
 * 
 * - Return 1 when date1 is older then date2
 * 
 * - Return -1 when date1 is newest then date2
 * 
 * - Return 0 when date1 is same than date2
 * 
 */
function compareDates(date1: Date, date2: Date, compareTime: boolean = true) {
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

function timeBetweenDates(endDate: Date, startDate: Date) {
    return Math.floor(endDate.getTime() - startDate.getTime());
}

function randomString(length: number) {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let random = "";
    for (let i = 0; i < length; i++) {
        random += alpha.charAt(randomNumber(alpha.length));
    }
    return random;
}

//CASO PRECISA, TESTAR AINDA
function normalizeToString(str: string) {
    return str.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
}

export {
    randomNumber,
    chance,
    sleep,
    LoopFunction,
    shuffleArray,
    compareDates,
    timeBetweenDates,
    randomString,
    normalizeToString
};
