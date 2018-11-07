// 扔漂流瓶

const request = require('request');

for (let i = 1; i <= 10; i++) {
  (function(i) {
    request.post({
      url: 'http://127.0.0.1:8362/bottle/throw',
      json: {'owner': 'bottle' + i, 'type': 'male', 'content': 'content' + i}
    });
  })(i);
}

for (let i = 11; i <= 20; i++) {
  (function(i) {
    request.post({
      url: 'http://127.0.0.1:8362/bottle/throw',
      json: {'owner': 'bottle' + i, 'type': 'female', 'content': 'content' + i}
    });
  })(i);
}
