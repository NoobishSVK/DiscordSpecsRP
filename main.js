/**
 * External Plugins
 * @param si                https://github.com/sebhildebrandt/systeminformation
 * @param client            https://github.com/devsnek/discord-rich-presence
 */
const si = require('systeminformation');
const client = require('discord-rich-presence')('1070435652040134706');

/**
 * Internal node.js plugins
 * @param os                Operating System Info 
 */
const os = require('os');

/**
 * App variables & definitions 
 * @param replaceValues     Values for string simplification
 * @param appVersion        Current version of the app
 */
const replaceValues = require('./values.js');
const appVersion = "1.1.4";


////////////////////////////////////////////////
//          APP FUNCTIONS START HERE          //
////////////////////////////////////////////////


/**
 * Data gatherers
 * @param cpuPromise        CPU data gatherer & resolver    (via @param si)
 * @param gpuPromise        GPU Data gatherer & resolver    (via @param si)
 * @param ramPromise        RAM Data gatherer & resolver    (via @param si)
 * @param osPromise         OS Data gatherer & resolver     (via @param os)
 */

const cpuPromise = new Promise((resolve, reject) => {
  si.cpu(function(data) {
    cpuModel = Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.brand);
    cpuFrequency = Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.speedMax.toFixed(1));
    resolve(data.manufacturer + " " +cpuModel + " @ " + cpuFrequency + " GHz");
  });
});

const gpuPromise = new Promise((resolve, reject) => {
  si.graphics(function(data) {
    resolve(Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.controllers[0].model));
  });
});

const ramPromise = new Promise((resolve, reject) => {
    resolve(Math.ceil(os.totalmem() / Math.pow(1024, 3)));
});

const osPromise = new Promise((resolve, reject) => {
  si.osInfo(function(data) {
    resolve(data.distro + data.arch.replace('x86', '[32-bit]')
    .replace('x64', ' [64-bit]')
    .replace('arm64', ' [ARM 64-bit]'));
  });
});

/**
 * Data handling - happens after all the data is gathered and ready to parse via @function Promise.all
 * @param specCpu, @param specGpu, @param specRam, @param specOs parsed data values ready for display
 */

Promise.all([cpuPromise, gpuPromise, ramPromise, osPromise])
  .then(values => {
    const [specCpu, specGpu, specRam, specOs] = values;

    drawConsoleData(specCpu, specGpu, specRam, specOs);

    client.updatePresence({
      state: specGpu + " • " + specRam + "GB RAM",
      details: specCpu,
      largeImageText: specOs,
      smallImageText: "DiscordSpecsRP " + appVersion,
      largeImageKey: 'logo',
      smallImageKey: 'checkmark',
      instance: true,
      buttons: [{label : 'Share your specs now!' , url: 'https://github.com/NoobishSVK/DiscordSpecsRP'}]
    });
  })
  .catch(error => {
    console.error("\x1b[31m[ERROR] " + error);
  });

/**
 * Draw console data
 */

  function drawConsoleData(specCpu, specGpu, specRam, specOs) {
    console.log("*******************************");
    console.log("**      DiscordSpecsRP       **");
    console.log("*******************************");
    console.log("");
    console.log("Detected specs:")
    console.log("\x1b[35m[CPU] \x1b[37m" + specCpu);
    console.log("\x1b[35m[GPU] \x1b[37m" + specGpu);
    console.log("\x1b[35m[RAM] \x1b[37m" + specRam + "GB RAM");
    console.log("\x1b[35m[OS]  \x1b[37m" + specOs);
    console.log("")
    console.log("\x1b[32mDiscord Rich Presence is now showing your specs.");
  }