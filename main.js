const si = require('systeminformation');
const replaceValues = require('./values.js');

var version = "1.0.0";

si.cpu(function(data) {
    console.log(Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.brand));
})