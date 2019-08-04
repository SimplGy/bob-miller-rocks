# Memories of Robert Miller

A memorial website for my Grandpa.

## Technical Design

The site displays content from a google spreadsheet, collected by google forms. It uses Tabletop.js to interface with the google sheets api.

Here's the real-time version:

```
google forms -> google sheet -> this site
```

This is slow though, because users have to load the site, then wait for an api call to google sheets to get the content.

It'd be faster if we just pre-constructed the content as though it were a static site. Write time, instead of read time.

Here's that design:

```
google forms ---> google sheet
              \-> remote lambda call -> load dynamic.html -> loads from google sheet -> save rendered html
```

Later, when a user loads `index.html`, it's just a static site with blazing load times.

To regenerate the content, we can hit the rpc endpoint at any time. I'm trusting the google forms' post-submit hook to be called after the spreadsheet is updated, but need to verify this.

What we end up with is:

* https://bob.miller.rocks/index-dynamic.html -- the "live", async fetching dynamic website
* https://bob.miller.rocks/index.html -- the statically generated site

## Deploying

The site:

* Github Pages owns the deployment: [simple.gy/bob-miller-rocks](https://www.simple.gy/bob-miller-rocks/).
* [Google Form](https://docs.google.com/forms/d/1qA4iDTeJvQGKEHO4VAjOzD4Q-1f_VQ1wmWIKnX_RTL4/edit) (careful about changing the question titles, that impacts the column names in the output data)
* [Google Sheet](https://docs.google.com/spreadsheets/d/1VJ6Hw5bMgW3KzT9veA2EjQ_JIlcXsS2UYC2V8x4Gs2Y)

The script:

1. Open Google cloud function
1. paste contents of `package.json` into the matching tab
1. paste contents of `addFileToGit.js` into the index.js tab
1. paste contents of `getHtmlFor.js` into the index.js tab under the other content
1. Replace the `const { auth } = require('./_secrets');` line with a string const generated by the github ui
1. Rm `const {addFileToGit} = require('./addFileToGit');`, since we manually c+p in that dependency

Then you should be able to run the function at:

    https://us-central1-side-projects-248720.cloudfunctions.net/updateStaticHtml?url=https://bob.miller.rocks/index-dynamic.html

When it succeeds it says "successfully processed n chars of html" and you'll see a new git commit in this repo.

## Scripts

One time install:

    cd scripts && npm install

To test adding a file to Git:

    node -e 'require("./scripts/addFileToGit").addFileToGit("foo.txt", "bar")'
    
Test pulling html from a site:

    node -e 'require("./scripts/getHtmlFor").debug("https://bob.miller.rocks/index-dynamic.html")'


## TODO

- [x] mobile reading
- [x] favicon
- [x] static rendering
