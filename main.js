/**
 * Plugins
 * @param si      https://github.com/sebhildebrandt/systeminformation
 * @param Tray    https://github.com/131/trayicon
 * @param client  https://github.com/devsnek/discord-rich-presence
 */
const si = require('systeminformation');
const client = require('discord-rich-presence')('1070435652040134706');
const Tray = require('trayicon'); // 

/**
 * App data
 */
const replaceValues = require('./values.js');
const appVersion = "1.0.0";

/**
 * Tray functions
 */

Tray.create(function(tray) {
    tray.setTitle("DiscordSpecsRP " + appVersion);

    let main = tray.item("Visible specs");
    main.add(tray.item("CPU"), tray.item("GPU"), tray.item("RAM"), tray.item("OS"));

    tray.separator();

    let quit = tray.item("Quit", () => tray.kill());
    tray.setMenu(main, quit);
});

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
  si.memLayout(function(data) {
    let ramspace = 0.0;
    for (const bankSlot of data) {
      ramspace += bankSlot.size
      var bankSize = bankSlot.size / Math.pow(1024, 3);
    }
    resolve(Math.ceil(bankSize));
  });
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
    console.log(specCpu, specGpu, specRam + "GB RAM", osPromise);
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