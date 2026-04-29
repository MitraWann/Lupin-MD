let fetch = require('node-fetch');

let handler = async (m, { conn }) => {
	let url = gensin[Math.floor(Math.random() * gensin.length)]
	conn.sendFile(m.chat, url, 'gensin.jpg', '_Chagiyaaa..._', m);
}
handler.command = /^(chagiya)$/i;
handler.tags = ['internet'];
handler.help = ['chagiya'];
handler.limit = false;
module.exports = handler;

global.gensin = [
  "https://image2url.com/r2/default/images/1770976668650-a2a92227-42e6-42d5-93ef-6619ffb8d41b.jpg",
    "https://image2url.com/r2/default/images/1770976957786-d235e907-f6ae-4969-b128-21bb451e9c9d.png",
    "https://image2url.com/r2/default/images/1770977118477-8965b534-8fc7-4534-a9a5-ce7413f22bf0.png",
    "https://image2url.com/r2/default/images/1770977305467-780b0185-ea87-4365-894d-5049c192d473.png",
    "https://image2url.com/r2/default/images/1770977618572-a924bb97-adef-4d53-a909-c14a0f12186a.png",
    "https://image2url.com/r2/default/images/1770977675883-613ffb8e-6c6e-462c-9582-1e554e12d6a1.png",
    "https://image2url.com/r2/default/images/1770977757856-57a304d2-dd4c-4c08-abbf-969e44194e74.png",
    "https://image2url.com/r2/default/images/1770977822497-cda41e3e-f94f-4256-81c9-8f6b3c5f79f5.png",
    "https://image2url.com/r2/default/images/1770977925956-ddbe22ab-15c0-43a6-a8a7-073132e8d9eb.png",
    "https://image2url.com/r2/default/images/1770977957975-418b349d-5c42-4475-ab73-7503d2eeb90d.png",
    "https://image2url.com/r2/default/images/1770978008472-780b5b9b-ec8a-4c3a-9535-9dc75b7628d4.png",
    "https://image2url.com/r2/default/images/1770978075970-ac06f569-a016-4fc1-95f1-53b360087304.png",
    "https://image2url.com/r2/default/images/1770978169976-b85df6ca-24f1-43da-95e1-5f03af828b42.png",
    "https://image2url.com/r2/default/images/1770978206446-f2c094b9-1e01-477c-ac1b-8572d2b07ed9.png",
    "https://image2url.com/r2/default/images/1770978618015-f8914bcf-cfbc-4e06-9156-36f7d635f93d.png",
    "https://image2url.com/r2/default/images/1770980632767-9616c7af-1b3f-43b8-87b5-e6be6a1def75.png",
    "https://image2url.com/r2/default/images/1770980681523-fc3befe5-f04c-4c00-8a19-fc8d17d6e797.png",
    "https://image2url.com/r2/default/images/1770980788734-fb616251-fd7d-44b6-9e50-a1c09514b10e.png",
    "https://image2url.com/r2/default/images/1770980902769-27184d62-8854-47e1-af24-8b9b4776180b.png",
    "https://image2url.com/r2/default/images/1770980941139-80a85c4a-46e2-40f6-84e6-dfb2565f1685.png",
    "https://image2url.com/r2/default/images/1770981111482-5769b68c-7bef-4342-b89f-70ec9be92731.png",
    "https://image2url.com/r2/default/images/1770981138086-6ede1f3c-6f74-4a0d-bdba-55f21841bf87.png",
    "https://image2url.com/r2/default/images/1770976816283-dd02d387-b542-4e55-8c76-ebcadbbe88e8.jpg",
  "https://i.postimg.cc/MGMkwtcW/1001210206.jpg",
  "https://i.postimg.cc/ZqBkmj94/1001210207.jpg",
  "https://i.postimg.cc/9QN3ssf0/1001210208.jpg",
  "https://i.postimg.cc/QdnLvvMX/1001210209.jpg",
  "https://i.postimg.cc/8CJ8GwFW/1001210210.jpg",
  "https://i.postimg.cc/pdhNvk9Z/1001210211.jpg",
  "https://i.postimg.cc/Dzt9wss1/1001210212.jpg",
  "https://i.postimg.cc/TPZz3mmc/1001210213.jpg",
  "https://i.postimg.cc/wBSCjJJw/1001210214.jpg",
  "https://i.postimg.cc/TPZz3mmk/1001210215.jpg",
  "https://i.postimg.cc/7LpFZ77Q/1001210216.jpg",
  "https://i.postimg.cc/SKwBx8Cb/1001210217.jpg",
  "https://i.postimg.cc/tTWLZTtc/1001210218.jpg",
  "https://i.postimg.cc/W3gQF3Y/1001210219.jpg",
  "https://i.postimg.cc/26hPb67R/1001210220.jpg",
  "https://i.postimg.cc/TwgZLwJx/1001210221.jpg",
  "https://i.postimg.cc/Qt1R9tJj/1001210222.jpg",
  "https://i.postimg.cc/0QDLMQ0N/1001210223.jpg",
  "https://i.postimg.cc/MTVhMTmT/1001210224.jpg",
  "https://i.postimg.cc/Qt1R9tJH/1001210225.jpg",
  "https://i.postimg.cc/W3gQF3wJ/1001210226.jpg",
  "https://i.postimg.cc/tTWLZTNn/1001210227.jpg",
  "https://i.postimg.cc/6qKFdXMW/1001210228.jpg",
  "https://i.postimg.cc/mk4KQsmD/1001210229.jpg",
  "https://i.postimg.cc/J08SbLpt/1001210230.jpg",
  "https://i.postimg.cc/j2TBzbMn/1001210231.jpg",
  "https://i.postimg.cc/sxzbprTh/1001210232.jpg",
  "https://i.postimg.cc/vTyCWs0t/1001210233.jpg",
  "https://i.postimg.cc/KjbCn207/1001210234.jpg",
  "https://i.postimg.cc/C509jgc4/1001210235.jpg",
  "https://i.postimg.cc/Bb3Rx0mp/1001210236.jpg",
  "https://i.postimg.cc/mk4KQsmp/1001210237.jpg"
  ]

