const googlehome = require('./google-home-notifier');
const language = 'ja'; // if not set 'us' language will be used

//googlehome.device('ファミリールーム', language); // Change to your Google Home name
googlehome.ip('192.168.10.16', language);

googlehome.notify('こんにちは', (res) => {
  console.log(res);
});