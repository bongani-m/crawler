const HCCrawler = require('headless-chrome-crawler');
const PodcastEpisode = require('./podcast-episode');
const Podcast = require('./podcast');
const Category = require('./category');
const connectToDb = require('./db');
const { parseFeedUrl } = require('./feed-parser');

connectToDb();

(async () => {
  const crawler = await HCCrawler.launch({
    maxDepth: 5,
    maxConcurrency: 40,
    allowedDomains:['podcasts.apple.com'],
    followSitemapXml: true,
    obeyRobotsTxt: true,
    evaluatePage: (async () => {
      const url = $('link[rel="canonical"]').attr('href');
        if(url.match(/https:\/\/podcasts.apple.com\/\w{2}\/genre\/.*\/id\d+/g) && !url.includes('?letter=')) {
          let name = $('title').text();
          name = name.substring(0, name.length - 31);
          links = $('#selectedcontent > div > ul > li > a');
          let topPodcasts = [];
          for(var i = 0; i < links.length; i++) {
            topPodcasts.push(links[i].text);
          }
          return await new Promise((resolve, reject) => resolve({type: 'CATEGORY', url, name, topPodcasts}));
        }else if(url.match(/https:\/\/podcasts.apple.com\/\w{2}\/podcast\/.*\/id\d+/g)) {
          const token = JSON.parse(decodeURIComponent($("meta[name='web-experience-app/config/environment']").attr('content'))).MEDIA_API.token;
          const d = url.split('/');
          var s =  await window.fetch(`https://amp-api.podcasts.apple.com/v1/catalog/${d[3]}/podcasts/${d[6].substring(2)}/episodes?offset=0&limit=10`, {"credentials":"include","headers":{"accept":"application/json","accept-language":"en-US,en;q=0.9,es;q=0.8","authorization":`Bearer ${token}`,"content-type":"application/x-www-form-urlencoded; charset=UTF-8","sec-fetch-mode":"cors","sec-fetch-site":"same-site"},"referrer":`http://webcache.googleusercontent.com/search?q=cache:${url}`,"referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"});
          const data = await s.json();
          const name = $('title').text().substring(0, $('title').text().length - 18);

          const { artistName, feedUrl, contentRating, artwork, genreNames } = data.data[0].attributes;
          const podcast = {
            name,
            author: artistName,
            url: feedUrl,
            contentRating,
            artwork: { ...artwork, bgColor: undefined, textColor1: undefined, textColor2: undefined, textColor3: undefined, textColor4: undefined,},
            contentRating,
            description: $('div.product-hero-desc.product-hero-desc--side-bar').text().trim(),
            genreNames,
          };
          return {...podcast, type: 'PODCAST' };
        } else {
          return await new Promise((resolve, reject) => resolve({
            type: 'SKIP'
          }));
        }
    }),
      // Function to be called with evaluated results from browsers
      onSuccess: (async res => {
        console.log({type: res.result.type, url: res.options.url});
        if(res.result.type == "CATEGORY" && res.result.name != '') {
          const { name, url, topPodcasts } = res.result;
          let categoryToAdd = Category({ name, url, topPodcasts });
          try {
            await Category.addCategory(categoryToAdd);
            console.log('Adding Category...');
          } catch (e) {
            console.log('Error in getting Categories- ' + e);
          }
        } else if(res.result.type == "PODCAST") {
          const {
            name,
            author,
            artwork,
            contentRating,
            description,
            url,
            genreNames,
        } = res.result;
          let podcastToAdd = Podcast({
            name,
            author,
            artwork,
            contentRating,
            description,
            url,
            genreNames,
        });
        try {
          await Podcast.addPodcast(podcastToAdd);
          console.log('Adding Podcast...');
        } catch (e) {
          console.log('Error in getting Podcasts- ' + e);

        }
          let feed = undefined;
          try {
            feed = await parseFeedUrl(url);
          } catch (e) {
            console.log(e)
          }
          const episodes = feed.map(episode => {
            const {title, description, pubDate, duration, enclosure} = episode;
            return ({
              title,
              author,
              podcast: name,
              artwork,
              pubDate: new Date(pubDate),
              media: {fileType: enclosure.type, length: enclosure.length, url: enclosure.url, duration},
              description,
            });
          })
          const episodesToSave = episodes.map(episode => PodcastEpisode(episode));
          for(var i = 0; i < episodesToSave.length; i++) {
            try {
              await PodcastEpisode.addPodcastEpisode(episodesToSave[i]);
              console.log('Adding Podcast Episode...');
            } catch (e) {
              console.log('Error in getting Podcast Episodes- ' + e);
            }
            }
        }  
      }),
    });
  await crawler.queue('https://podcasts.apple.com/us/genre/podcasts/id26');
  await crawler.onIdle();
  await crawler.close();
})();