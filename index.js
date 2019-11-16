var googlehome = require('./google-home-notifier');
var language = 'ja'; // if not set 'us' language will be used

googlehome.device('ファミリールーム', language); // Change to your Google Home name
// or if you know your Google Home IP
// googlehome.ip('192.168.1.20', language);

googlehome.notify('こんにちは', function(res) {
  console.log(res);
});