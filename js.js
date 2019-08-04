window.addEventListener('DOMContentLoaded', init)

// Used to index into the spreadsheet's row data
// These key values are odd, but match the google forms -> spreadsheet keys we get from Tabletop
const cols = {
  text: 'pleaseshareamemoryorstoryaboutrobertmiller',
  name: 'yourname',
  date: 'timestamp',
};

// generate an html element
const elWithText = (tag, text, className, title) => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (title) {
    el.title = title;
  }
  el.innerText = text;
  return el;
}

/** Shuffles array in place */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const gotRows = (rows) => {
  shuffle(rows);
  console.log(rows);
  const ul = document.createElement('ul');
  rows.forEach(row => {
    const date = new Date(row[cols.date]);
    const dateSentence = `Shared on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    const ms = Number(date);
    const name = row[cols.name];
    const text = row[cols.text];
    if (text == null || text.trim() === '') {
      console.info('No text for this row: ', row); // shouldn't happen, but if so let's fail and continue
      return;
    }

    const li = document.createElement('li');
    li.id = `m-${ms}`; // for permalink
    li.appendChild(elWithText('p', text, 'text'));
    if (name) {
      li.appendChild(elWithText('p', `from ${name}`, 'name muted', dateSentence));
    }
    ul.appendChild(li);
  });

  const memories = document.querySelector('#Memories');
  memories.innerHTML = ''; // Empty
  memories.appendChild(ul);
};

function init() {
  // const demoUrl = 'https://docs.google.com/spreadsheets/d/0AmYzu_s7QHsmdDNZUzRlYldnWTZCLXdrMXlYQzVxSFE/pubhtml';
  // const key = 'https://docs.google.com/spreadsheets/d/1VJ6Hw5bMgW3KzT9veA2EjQ_JIlcXsS2UYC2V8x4Gs2Y/edit?usp=sharing';
  const key = '1VJ6Hw5bMgW3KzT9veA2EjQ_JIlcXsS2UYC2V8x4Gs2Y';
  const callback = (rows, tabletop) => gotRows(rows);
  Tabletop.init({ key, callback, simpleSheet: true, prettyColumnNames: false });
}
