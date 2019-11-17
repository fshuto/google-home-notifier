const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const mdns = require('mdns-js');
const browser = mdns.createBrowser(mdns.tcp('googlecast'));
let deviceAddress;
let language;

var device = function(name, lang = 'en') {
    device = name;
    language = lang;
    return this;
};

var ip = function(ip, lang = 'en') {
  deviceAddress = ip;
  language = lang;
  return this;
}

var googletts = require('google-tts-api');
var googlettsaccent = 'us';
var accent = function(accent) {
  googlettsaccent = accent;
  return this;
}

const notify = (message, callback) => {
  if (!deviceAddress){
    browser.on('ready', () => {
      browser.discover();
    });
    browser.on('update', (service) => {
      console.log('Device "%s" at %s:%d', service.fullname, service.addresses[0], service.port);
      if (service.fullname != undefined && service.fullname.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, deviceAddress, (res) => {
          callback(res);
        });
        browser.stop();
      }
    });
  }else {
    getSpeechUrl(message, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var play = function(mp3_url, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.fullname, service.addresses[0], service.port);
      if (service.fullname.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getPlayUrl(mp3_url, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      callback(res);
    });
  }
};

const getSpeechUrl = (text, host, callback) => {
  googletts(text, language, 1, 1000).then((url) => {
    onDeviceUp(host, url, (res) => {
      callback(res)
    });
  }).catch((err) => {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, host, callback) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
};

const onDeviceUp = (host, url, callback) => {
  const client = new Client();
  client.connect(host, () => {
    client.launch(DefaultMediaReceiver, (err, player) => {

      const media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, (err, status) => {
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', (err) => {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

exports.ip = ip;
exports.device = device;
exports.accent = accent;
exports.notify = notify;
exports.play = play;
