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

## Deploying

The site's static assets are deployed by github pages on any git push.

* Github Pages owns the deployment: [simple.gy/bob-miller-rocks](https://www.simple.gy/bob-miller-rocks/).
* [Google Form](https://docs.google.com/forms/d/1qA4iDTeJvQGKEHO4VAjOzD4Q-1f_VQ1wmWIKnX_RTL4/edit) (careful about changing the question titles, that impacts the column names in the output data)
* [Google Sheet](https://docs.google.com/spreadsheets/d/1VJ6Hw5bMgW3KzT9veA2EjQ_JIlcXsS2UYC2V8x4Gs2Y)

## Scripts

To test adding a file to Git:

    node -e 'require("./scripts/addFileToGit").main("foo.txt", "bar")'
    
Test pulling html from a site:

    node -e 'require("./scripts/getHtmlFor").debug("https://bob.miller.rocks")'


## TODO

- [x] mobile reading
- [x] favicon
- [ ] static rendering

