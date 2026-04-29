const axios = require('axios');
const cheerio = require('cheerio');

var durationMultipliers = {
  1: { 0: 1 },
  2: { 0: 60, 1: 1 },
  3: { 0: 3600, 1: 60, 2: 1 }
};

function youtubeSearch(query) {
  return new Promise((resolve, reject) => {
    // Header Accept-Language untuk menghindari output bahasa Jerman
    axios("https://m.youtube.com/results?search_query=" + query, { 
        method: "GET", 
        headers: { 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' 
        } 
    }).then(({ data }) => {
      const $ = cheerio.load(data)
      var sc;
      $('script').map(function () {
        const el = $(this).html();
        let regex;
        if ((regex = /var ytInitialData = /gi.exec(el || ''))) {
          sc = JSON.parse(regex.input.replace(/^var ytInitialData = /i, '').replace(/;$/, ''));
        }
        return regex && sc;
      });
      var results = { video: [], channel: [], playlist: [] };
      sc.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.forEach((v) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
        const typeName = Object.keys(v)[0];
        const result = v[typeName];
        if (['horizontalCardListRenderer', 'shelfRenderer'].includes(typeName)) { return; }
        const isChannel = typeName === 'channelRenderer';
        const isVideo = typeName === 'videoRenderer';
        const isMix = typeName === 'radioRenderer';
        
        if (isVideo) {
          const view = ((_a = result.viewCountText) === null || _a === void 0 ? void 0 : _a.simpleText) || ((_b = result.shortViewCountText) === null || _b === void 0 ? void 0 : _b.simpleText) || ((_d = (_c = result.shortViewCountText) === null || _c === void 0 ? void 0 : _c.accessibility) === null || _d === void 0 ? void 0 : _d.accessibilityData.label);
          const _duration = (_f = (_e = result.thumbnailOverlays) === null || _e === void 0 ? void 0 : _e.find((v) => Object.keys(v)[0] === 'thumbnailOverlayTimeStatusRenderer')) === null || _f === void 0 ? void 0 : _f.thumbnailOverlayTimeStatusRenderer.text;
          const videoId = result.videoId;
          const duration = ((_g = result.lengthText) === null || _g === void 0 ? void 0 : _g.simpleText) || (_duration === null || _duration === void 0 ? void 0 : _duration.simpleText);
          let durationS = 0;
          (_h = ((duration === null || duration === void 0 ? void 0 : duration.split('.').length) && duration.indexOf(':') === -1 ? duration.split('.') : duration === null || duration === void 0 ? void 0 : duration.split(':'))) === null || _h === void 0 ? void 0 : _h.forEach((v, i, arr) => (durationS += durationMultipliers[arr.length]['' + i] * parseInt(v)));
          results.video.push({
            authorName: (_l = (((_j = result.ownerText) === null || _j === void 0 ? void 0 : _j.runs) || ((_k = result.longBylineText) === null || _k === void 0 ? void 0 : _k.runs) || [])[0]) === null || _l === void 0 ? void 0 : _l.text,
            videoId,
            url: encodeURI('https://www.youtube.com/watch?v=' + videoId),
            thumbnail: result.thumbnail.thumbnails.pop().url,
            title: (_t = (((_r = (_q = result.title) === null || _q === void 0 ? void 0 : _q.runs.find((v) => v.text)) === null || _r === void 0 ? void 0 : _r.text) || ((_s = result.title) === null || _s === void 0 ? void 0 : _s.accessibility.accessibilityData.label))) === null || _t === void 0 ? void 0 : _t.trim(),
            durationH: ((_0 = result.lengthText) === null || _0 === void 0 ? void 0 : _0.accessibility.accessibilityData.label) || (_duration === null || _duration === void 0 ? void 0 : _duration.accessibility.accessibilityData.label),
            durationS,
            duration,
            viewH: view,
            type: typeName.replace(/Renderer/i, '')
          });
        }
      })
      resolve(results)
    }).catch(reject)
  })
}

module.exports = { youtubeSearch };