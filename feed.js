const { parseFeedUrl } = require('./feed-parser');
parseFeedUrl('http://feeds.wnyc.org/snapjudgment-wnyc').then(e => console.log(e));