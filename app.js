const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { README_URL, REPO_URL } = require('./lib/constants');

(async () => {
  const { data: readmeHTML } = await axios.get(README_URL);
  const $ = cheerio.load(readmeHTML);
  const $contentsList = $('#user-content-contents').parent().next('ul');
  const getContent = ($mainList) => $mainList.children('li').map((index, elem) => {
    const $anchor = $(elem).children('a');
    const $childUl = $(elem).children('ul');
    return {
      title: $anchor.text(),
      url: REPO_URL + $anchor.attr('href'),
      children: $childUl.length ? getContent($childUl) : null
    };
  }).get();
  const data = getContent($contentsList);
  if (fs.existsSync('./data')) {
    fs.rmdirSync('./data', { recursive: true });
  }
  fs.mkdirSync('./data');
  fs.writeFile('./data/content.json', JSON.stringify(data, null, 2), null, () => {
    console.log('Data updated successfully');
  });
})();
