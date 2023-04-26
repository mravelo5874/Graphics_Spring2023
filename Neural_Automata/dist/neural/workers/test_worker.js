"use strict";
onmessage = function (event) {
    let data = event.data; // data sent by the Vue component is retrieved from 'data' attribute
    console.log('worker: ' + data);
    let result = data * 2;
    console.log('result: ' + result);
    postMessage(result);
};
//# sourceMappingURL=test_worker.js.map