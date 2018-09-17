var fs = require('fs');
var os = require('os');
var Cryptr = require('cryptr');
var cryptr = new Cryptr('ZQ7d6F3Edb2eg');
var destination = os.homedir()+'/Documents/eJouranl';
var profileLoc = destination+'/profile-json';
var dataLoc = destination+'/eJournal.db';
const fetchData = function(fileLocation){
  // GET ALL JSON FILE DATA
  try {
    var dataString = fs.readFileSync(fileLocation);
    if (fileLocation === dataLoc) {
      var x = cryptr.decrypt(dataString);
      return JSON.parse(x);
    }
    return JSON.parse(dataString);
  } catch(e){
    return [];
  }
};
const saveData = function(entry) {
  // SAVE DATA
  var x = cryptr.encrypt(JSON.stringify(entry));
  fs.writeFile(dataLoc, x, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

module.exports = {
  fetchData,
  saveData,
  directoryCheck: function() {
    // check if Directory exists
    // if no directory found one is created
    if (!fs.existsSync(destination)){
      fs.mkdir(destination, function(err){
        if (err) {
          return console.error(err);
        }

        var userData = {
          userName: os.userInfo().username,
          address: os.networkInterfaces()["Wi-Fi"][3].address,
          host: os.hostname(),
          timeStamp: new Date().getTime()
        }
        fs.writeFile(profileLoc, JSON.stringify(userData), (err) => {
          if (err) {
            return console.log(err);
          }
          return userData;
        });
      });
    }
  },
  removeData: function(id) {
    // REMOVE DATA BY ID
    var data = fetchData(dataLoc);
    var filteredData = data.filter((entry) => entry.id != id);
    saveData(filteredData);
    return data.length !== filteredData.length;
  },
  getAuthId: function(){
    // GET USER AUTH ID
    var author = fetchData(profileLoc);
    return author.timeStamp+'_'+author.host;
  }
}
