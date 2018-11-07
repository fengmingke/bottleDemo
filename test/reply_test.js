// 回复漂流瓶

const request = require('request');

request.post({
  url: 'http://127.0.0.1:8362/bottle/reply/5bd87c2aca7af218dc2b06b7',
  json: {'user': 'bottle_test', 'content': 'content_test'}
});
