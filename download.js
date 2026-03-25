const https = require('https');
const fs = require('fs');

const files = [
  { url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdjMzI0N2Q2MTZiMTRkMGFiYzUyYjQwYThmZTBlMzliEgsSBxCmzo6NwAYYAZIBIwoKcHJvamVjdF9pZBIVQhM0NDgwMTk4NjM5Mjg3MzMzMTYw&filename=&opi=96797242", name: "public/dashboard.html" },
  { url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQwMDBhYzFkZDhlYjRhNTM4YmNhMTM0MjY2NmI4OTUxEgsSBxCmzo6NwAYYAZIBIwoKcHJvamVjdF9pZBIVQhM0NDgwMTk4NjM5Mjg3MzMzMTYw&filename=&opi=96797242", name: "public/marketplace.html" },
  { url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E4YTgyN2RjZTE4MTQ0NDNhMDhmYjYyY2NjZTI4NzIxEgsSBxCmzo6NwAYYAZIBIwoKcHJvamVjdF9pZBIVQhM0NDgwMTk4NjM5Mjg3MzMzMTYw&filename=&opi=96797242", name: "public/index.html" }
];

if (!fs.existsSync('public')) fs.mkdirSync('public');

files.forEach(file => {
  https.get(file.url, (res) => {
    let rawHtml = '';
    res.on('data', d => rawHtml += d);
    res.on('end', () => {
      fs.writeFileSync(file.name, rawHtml);
      console.log(`Downloaded ${file.name}`);
    });
  }).on('error', (e) => console.error(e));
});
