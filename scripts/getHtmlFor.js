/**
 * This file is intended for deployment as a google cloud function.
 * It uses puppetteer to pull the rendered html from a website.
 */

const puppeteer = require('puppeteer');

let page;
const fileToGenerate = 'index.html';
const waitUntil = 'networkidle0'
  // consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
  // often used: 'networkidle2'

/**
 * Remove all script tags. We're letting the page evaluate scripts with networkidle0,
 * so we want to remove them after.
 * leave <head> scripts (eg: analytics)
 */
function rmScriptTags() {
  const els = [...document.querySelectorAll('body script')];
    els.forEach(tag =>
      tag.parentNode.removeChild(tag)
    );
}

async function getBrowserPage() {
  // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  return browser.newPage();
}



/**
 * Load a page, wait, then pull the html from it as a string.
 */
exports.main = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send('Please provide URL as GET parameter, for example: <code>?url=https://example.com</code>');
  if (!page) page = await getBrowserPage();

  await page.goto(url, {waitUntil});
  await page.evaluate(rmScriptTags);
  const html = await page.content(); // get computed page html
  await addFileToGit(fileToGenerate, html);
  
  // Send the response
  res.set('Content-Type', 'text/html');
  res.status(200);
  res.send(`Successfully processed ${html.length} chars of html`);
  
  //console.log(html);
  //process.exit(0);
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