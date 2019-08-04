// deprecated

const puppeteer = require('puppeteer');
const {Storage} = require('@google-cloud/storage');

let page;

async function getBrowserPage() {
  // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  return browser.newPage();
}

exports.main = async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.send('Please provide URL as GET parameter, for example: <a href="?url=https://example.com">?url=https://example.com</a>');
  }
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto(url, {waitUntil: 'networkidle0'});
    // consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md

  await page.evaluate(rmScriptTags);

  const html = await page.content(); // get computed page html

  // Save the html to our google storage bucket
  const bucket = (new Storage()).bucket('bob-miller');
  const file = bucket.file('latest2.html');
  await file.save(html, {metadata: { contentType: 'text/html'}});
  
  // Send the response
  // res.set('Content-Type', 'text/html');
  res.status(200);
  res.send(`Successfully processed ${html.length} chars of html`);
  process.exit(0);
};

// Remove all script tags. We're letting the page evaluate scripts with networkidle0,
// so we want to remove them after.
function rmScriptTags() {
  const els = [...document.querySelectorAll('script')];
    els.forEach(tag =>
      tag.parentNode.removeChild(tag)
    );
}

// Runner, for local debugging:
exports.main(
  {query: { url: 'https://bob.miller.rocks' }},
  {
    set: () => {},
    status: () => {},
    send: console.log,
  },
);
