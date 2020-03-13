const spawn = require('child_process').spawn;

module.exports = function(input, inputFormat = 'mediawiki', outputFormat = 'markdown_github') {
  if (!allowedFormats.includes(inputFormat)) return null;
  if (!allowedFormats.includes(outputFormat)) return null;

  return pandoc(input, ['-f', inputFormat, '-w', outputFormat]);
};

const allowedFormats = [
  'mediawiki',
  'markdown',
  'markdown_github'
];

function pandoc(src, options, pandocPath = 'pandoc') {
  return new Promise((resolve, reject) => {
    let result = '';
    let error = '';

    // Create child_process.spawn
    const pdSpawn = spawn(pandocPath, options);

    // Set handlers...
    pdSpawn.stdout.on('data', data => {
      result += data;
    });
    pdSpawn.stdout.on('end', () => {
      if (error.length > 0) reject(new Error(error));
      else resolve(result);
    });
    pdSpawn.stderr.on('data', data => {
      error += data;
    });
    //pdSpawn.stderr.on('data', onStdOutData);
    //pdSpawn.stderr.on('end', onStdOutEnd);
    pdSpawn.on('error', (err) => {
      reject(new Error(err+'\n'+error));
    });

    // If src is not a file, assume a string input.
    pdSpawn.stdin.end(src, 'utf-8');
  });
}
