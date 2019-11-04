const parser = require('parse-rss');


function duration(old) {
    var sum = 0;
    var arr = old.split(':');
    for(var i = arr.length; i > 0; i-- ) {
        sum += arr[i - 1] * Math.pow(60, arr.length - i);
    }
    return sum;
  }
  
  function parseItem(item) {
    var meta = item.meta;
    var parsed = {};
  
    ['title', 'pubDate', 'description'].forEach(key => {
        parsed[key] = item[key];
    });
    parsed.enclosure = item.enclosures[0];
    parsed.duration = item['itunes:duration'] !== undefined ? duration(item['itunes:duration']['#']) : 0;
  
    return parsed;
  }
  
  function parseFeed(rss) {
      if(rss != null) {
          return rss.map(parseItem);
      } else {
          return [];
      }
  }
  
  function parseFeedUrl(url) {
    return new Promise(function (resolve, reject) {
        parser(url, (err, rss) => {
            if (err) {
                reject(err);
            }
            resolve(parseFeed(rss));
        });
    });
  }

module.exports = { parseFeedUrl };