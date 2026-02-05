import { spawn } from 'child_process'

export default async function (input: string, inputFormat = 'mediawiki', outputFormat = 'markdown_github'): Promise<string> {
  if (!allowedFormats.includes(inputFormat)) {
    throw new Error(`Unallowed format ${inputFormat}. Allowed formats ${allowedFormats.join(', ')}`)
  }
  if (!allowedFormats.includes(outputFormat)) {
    throw new Error(`Unallowed format ${outputFormat}. Allowed formats ${allowedFormats.join(', ')}`)
  }

  return pandoc(input, ['-f', inputFormat, '-w', outputFormat])
}

const allowedFormats = [
  'mediawiki',
  'markdown',
  'markdown_github',
]

function pandoc(src: string, options: readonly string[], pandocPath = 'pandoc'): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = ''
    let error = ''

    // Create child_process.spawn
    const pdSpawn = spawn(pandocPath, options)

    // Set handlers...
    pdSpawn.stdout.on('data', data => {
      result += data
    })
    pdSpawn.stdout.on('end', () => {
      if (error.length > 0 && !result) reject(new Error(error))
      else resolve(result)
    })
    pdSpawn.stderr.on('data', data => {
      error += data
    })
    // pdSpawn.stderr.on('data', onStdOutData);
    // pdSpawn.stderr.on('end', onStdOutEnd);
    /* pdSpawn.on('error', (err) => {
      reject(new Error(err+'\n'+error));
    }); */

    // If src is not a file, assume a string input.
    pdSpawn.stdin.end(src, 'utf-8')
  })
}
