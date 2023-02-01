/**
 * Plugins
 */
const si = require('systeminformation'); // https://github.com/sebhildebrandt/systeminformation
const client = require('discord-rich-presence')('1070435652040134706');
const Tray = require('trayicon'); // https://github.com/131/trayicon

/**
 * App data
 */
const replaceValues = require('./values.js');
const appVersion = "1.0.0";

let specCpu = "";
//let specGpu = "";
//let specRam = "";

Tray.create(function(tray) {
    tray.setTitle("DiscordSpecsRP");
    let main = tray.item("Power");
    main.add(tray.item("on"), tray.item("on"));
    let quit = tray.item("Quit", () => tray.kill());
    tray.setMenu(main, quit);
});

const cpuPromise = new Promise((resolve, reject) => {
  si.cpu(function(data) {
    cpuModel = Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.brand);
    cpuFrequency = Object.entries(replaceValues).reduce((acc, [key, value]) => acc.replace(key, value), data.speedMax.toFixed(1));
    resolve(cpuModel + " @ " + cpuFrequency + " GHz");
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

Promise.all([cpuPromise, gpuPromise, ramPromise, osPromise])
  .then(values => {
    const [specCpu, specGpu, specRam, specOs] = values;
    console.log(specCpu, specGpu, specRam + "GB RAM", osPromise);
    client.updatePresence({
      state: specGpu + " • " + specRam + "GB RAM",
      details: specCpu,
      largeImageText: specOs,
      largeImageKey: 'logo',
      smallImageKey: 'checkmark',
      instance: true,
      buttons: [{label : 'Show your specs now!' , url : 'https://specinator.net'}]
    });
  })
  .catch(error => {
    console.error(error);
  });