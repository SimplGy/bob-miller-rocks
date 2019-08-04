const puppeteer = require('puppeteer');
const {rmScriptTags} = require('./utils');
const {fileToGenerate} = require('./_config');

if (fileToGenerate == null) return console.error('need fileToGenerate') && process.exit(91);

const waitUntil = 'networkidle0'
  // consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
  // often used: 'networkidle2'

let page;

async function getBrowserPage() {
  // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  return browser.newPage();
}

exports.main = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send('Please provide URL as GET parameter, for example: <code>?url=https://example.com</code>');
  if (!page) page = await getBrowserPage();

  await page.goto(url, {waitUntil});
  await page.evaluate(rmScriptTags);
  const html = await page.content(); // get computed page html

  // Save the html to our google storage bucket
  // await file.save(html, {metadata: { contentType: 'text/html'}});
  
  // await addFileToGit(fileToGenerate, html);
  
  // Send the response
  res.set('Content-Type', 'text/html');
  res.status(200);
  res.send(`Successfully processed ${html.length} chars of html`);
  
  console.log(html);
  process.exit(0);
};




// Runner, for local debugging:
exports.debug = (url) =>
  exports.main(
    {query: { url }},
    {
      set: console.log,
      status: console.log,
      send: console.log,
    },
  );