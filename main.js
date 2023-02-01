/**
 * External Plugins
 * @param si      https://github.com/sebhildebrandt/systeminformation
 * @param Tray    https://github.com/131/trayicon
 * @param client  https://github.com/devsnek/discord-rich-presence
 */
const si = require('systeminformation');
const client = require('discord-rich-presence')('1070435652040134706');
//const Tray = require('trayicon');

/* Internal node.js plugins */
var fs = require('fs');
const os = require('os');

/* App variables & definitions */
const replaceValues = require('./values.js');
const appVersion = "1.0";
var iconData = fs.readFileSync('./assets/img/icon.ico');
var running = true;


/**
 * pkg optimizations, this will allow the app to run once installed by pkg
 * also a fail catcher
 */
function killProcess() {
    running = false;
}

process.on('SIGTERM', killProcess);
process.on('SIGINT', killProcess);
process.on('uncaughtException', function(e) {
    console.log('[uncaughtException] app will be terminated: ', e.stack);
    killProcess();
});

function run() {
    setTimeout(function() {
        if (running) run();
    }, 10);
}

run();

/**
 * Tray functions
 */

/*Tray.create(function(tray) {
    tray.setTitle("DiscordSpecsRP " + appVersion);
    tray.setIcon(iconData);
    let main = tray.item("Check for updates");
    let specinator = tray.item("Download Specinator");

    let separator = tray.separator();

    let quit = tray.item("Quit", () => tray.kill());
    tray.setMenu(main, specinator, separator, quit);
});*/

/**
 * Data gatherers
 * @param cpuPromise
 * @param gpuPromise
 * @param ramPromise
 * @param osPromise
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
 * Data handling
 * Discord updates
 */

Promise.all([cpuPromise, gpuPromise, ramPromise, osPromise])
  .then(values => {
    const [specCpu, specGpu, specRam, specOs] = values;

    /* console logs with specs for debug purposes */
    console.log("Detected specs:")
    console.log("\x1b[35m[CPU] \x1b[37m" + specCpu);
    console.log("\x1b[35m[GPU] \x1b[37m" + specGpu);
    console.log("\x1b[35m[RAM] \x1b[37m" + specRam + "GB RAM");
    console.log("\x1b[35m[OS] \x1b[37m" + specOs);
    console.log("\x1b[32mDiscord Rich Presence is now showing your specs.")
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
    console.error(error);
  });