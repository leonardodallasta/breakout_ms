var plato = require('plato');

var files = [
    'main.js',
    'renderer.js',
    'components/Controls.js',
    'components/Draw.js',
    'components/Game.js',
];

var outputDir = './reports';
// null options for this example
var options = {
  title: 'report1'
};

var callback = function (report){
// once done the analysis,
// execute this
};

plato.inspect(files, outputDir, options);