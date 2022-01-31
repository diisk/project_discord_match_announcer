"use strict";
const ar = ["T1", "T", "T2", "T3", "T", "T4", "T5", "T"];
for (let i = 0; i < ar.length; i++) {
    if (ar[i].length == 2) {
        ar.splice(i, 1);
    }
}
console.log(ar);
//# sourceMappingURL=test.js.map