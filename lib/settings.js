/*jshint node: true*/

var settings = {
  port: 80,
  debug: false,
  verbose: false
};

//seperate parsing function for testing
var skip = false;
settings.parseArg = function( val, ind, arr ) {
  if (skip) {
    skip = false;
    return;
  }

  switch (val) {
    case '--debug':
    case '-d':
      settings.debug = true;
      break;

    case '--verbose':
    case '-v':
      settings.verbose = true;
      break;

    case '--port':
    case '-p':
      settings.port = parseInt(arr[ ind + 1 ]);
      skip = true;
      break;

    default:
      break;
  }
};

//parse arguments
process.argv.forEach(function(val, ind, arr) {
  settings.parseArg( val, ind, arr );
});

module.exports = settings;
