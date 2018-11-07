// const Redis = require('think-redis');
// const defaultConfig = {
//   port: 6379,
//   host: '127.0.0.1',
//   password: '',
//   db: 0
// };
// // const redisInst = new Redis();
// const redisInst = new Redis(defaultConfig);
// console.log(Redis);
// console.log(redisInst);

// async function test() {
//   // add event listener, supported events see at https://github.com/luin/ioredis
//   redisInst.on('connect', function() {
//     console.log('connect');
//   });
//   console.log('after connect event');

//   // set key
//   const s1 = await redisInst.set('name2', 'lushijie'); // never expire
//   // let s2 = await redisInst.set('name3', 'lushijie', 3000); // milliseconds
//   // let s3 = await redisInst.set('name4', 'lushijie', 'EX', '5'); // seconds
//   // let s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000); // milliseconds
//   console.log(s1);

//   // get key's value
//   const g1 = await redisInst.get('name2');
//   console.log(g1);
//   // delete key
//   const d1 = await redisInst.delete('name2');
//   console.log(d1);

//   // increase 1, if key not exist, set key's value eq 0 and then increase 1
//   await redisInst.increase('key');

//   // decrease 1, if key not exist, set key's value eq 0 then decrease 1
//   await redisInst.decrease('key');
// }
// test();

const redis = require('redis');
const client0 = redis.createClient(); // 0号数据库
const client1 = redis.createClient(); // 1号数据库
const client2 = redis.createClient(); // 2号数据库
const client3 = redis.createClient(); // 3号数据库
// console.log(client0.PEXPIRE);

function save(client, type, bottleId, bottle, time) {
  return new Promise(function(resolve, reject) {
    client.SELECT(type, function() {
      // 以hash类型保存漂流瓶对象
      client.HMSET(bottleId, bottle, function(err, result) {
        if (err) {
          return resolve({code: 0, msg: '过会儿再试试吧！'});
        }
        // 返回结果，成功返回OK
        resolve({code: 1, msg: result});
        if (time === 'ss') {
          // 设置漂流瓶生存期为30天
          client.EXPIRE(bottleId, 86400 * 30); // 单位秒
        } else {
          // 根据漂流瓶的原始时间戳设置生存期
          // client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now()); // 单位毫秒
          const m = Math.floor(bottle.time / 1000) + 86400 * 30 - Math.floor(Date.now() / 1000);
          client.EXPIRE(bottleId, m); // 单位秒
        }
      });
    });
  });
}

function pick(client, type) {
  return new Promise(function(resolve, reject) {
    client.SELECT(type, function() {
      // 随机返回一个漂流瓶id
      client.RANDOMKEY(function(err, bottleId) {
        // console.log('bottleId = ' + bottleId);
        if (err || !bottleId) {
          return resolve({code: 0, msg: '海星'});
        }
        // 根据漂流瓶id取到漂流瓶完整信息
        client.HGETALL(bottleId, function(err, bottle) {
          if (err) {
            return resolve({code: 0, msg: '漂流瓶破损了...'});
          }
          // 返回结果， 成功时包含捡到的漂流瓶信息
          resolve({code: 1, msg: bottle});
          // 从redis中删除该漂流瓶
          client.DEL(bottleId);
        });
      });
    });
  });
}

// 扔一个漂流瓶
exports.throw = function(bottle) {
  bottle.time = bottle.time || Date.now();
  // 为每个漂流瓶随机生成一个id
  const bottleId = Math.random().toString(16);
  const type = {male: 0, female: 1};
  return new Promise(function(resolve, reject) {
    // 先到2号数据库检查用户是否超过扔瓶子的次数限制
    client2.SELECT(2, function() {
      // 获取该用户扔瓶子的次数
      client2.GET(bottle.owner, async function(err, result) {
        if (err) {
          return resolve({code: 0, msg: '过会儿再试试吧！'});
        }
        if (result >= 10) {
          return resolve({code: 0, msg: '今天扔瓶子的机会已经用完啦...'});
        }
        // 扔瓶子次数加1
        client2.INCR(bottle.owner, function() {
          // 检查是否当天第一次扔瓶子
          // 若是，则设置记录该用户扔瓶子次数键的生存期为1天
          // 若不是，生存期保持不变
          client2.TTL(bottle.owner, function(err, ttl) {
            if (ttl === -1 && !err) {
              client2.EXPIRE(bottle.owner, 86400);
            }
          });
        });
        // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
        let res;
        if (type[bottle.type] === 0) {
          res = await save(client0, type[bottle.type], bottleId, bottle, 'ss');
        } else {
          res = await save(client1, type[bottle.type], bottleId, bottle, 'ss');
        }
        resolve(res);
        // client.SELECT(type[bottle.type], function() {
        //   // 以hash类型保存漂流瓶对象
        //   client.HMSET(bottleId, bottle, function(err, result) {
        //     if (err) {
        //       return resolve({code: 0, msg: '过会儿再试试吧！'});
        //     }
        //     // 返回结果，成功返回OK
        //     resolve({code: 1, msg: result});
        //     // 设置漂流瓶生存期为1天
        //     client.EXPIRE(bottleId, 86400); // 单位秒
        //   });
        // });
      });
    });
  });
};

// 扔回海里
exports.throwBack = function(bottle) {
  // 为漂流瓶随机生成一个id
  const bottleId = Math.random().toString(16);
  const type = {male: 0, female: 1};
  return new Promise(async function(resolve, reject) {
    // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
    let res;
    if (type[bottle.type] === 0) {
      res = await save(client0, type[bottle.type], bottleId, bottle, 'ms');
    } else {
      res = await save(client1, type[bottle.type], bottleId, bottle, 'ms');
    }
    resolve(res);
    // client.SELECT(type[bottle.type], function() {
    //   // 以hash类型保存漂流瓶对象
    //   client.HMSET(bottleId, bottle, function(err, result) {
    //     if (err) {
    //       return resolve({code: 0, msg: '过会儿再试试吧！'});
    //     }
    //     // 返回结果，成功返回OK
    //     resolve({code: 1, msg: result});
    //     // 根据漂流瓶的原始时间戳设置生存期
    //     client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now()); // 单位毫秒
    //   });
    // });
  });
};

// 检一个漂流瓶
exports.pick = function(info) {
  const type = {all: Math.round(Math.random()), male: 0, female: 1};
  info.type = info.type || 'all';
  return new Promise(function(resolve, reject) {
    // 先到3号数据库检查用户是否超过检瓶子次数限制
    client3.SELECT(3, function() {
      // 获取该用户检瓶子次数
      client3.GET(info.user, async function(err, result) {
        if (err) {
          return resolve({code: 0, msg: '过会儿再试试吧！'});
        }
        if (result >= 10) {
          return resolve({code: 0, msg: '今天检瓶子的机会用完啦...'});
        }
        // 检瓶子次数加1
        client3.INCR(info.user, function() {
          // 检查是否当天第一次检瓶子
          // 若是，则设置记录该用户检瓶子次数键的生存期为1天
          // 若不是，生存期保持不变
          client3.TTL(info.user, function(err, ttl) {
            if (ttl === -1 && !err) {
              client3.EXPIRE(info.user, 86400);
            }
          });
        });
        // 20%概率捡到海星
        if (Math.random() <= 0.2) {
          return resolve({code: 0, msg: '海星'});
        }
        // 根据请求的瓶子类型到不同的数据库中取
        let res;
        if (type[info.type] === 0) {
          res = await pick(client0, type[info.type]);
        } else {
          res = await pick(client1, type[info.type]);
        }
        resolve(res);
        // client.SELECT(type[info.type], function() {
        //   // 随机返回一个漂流瓶id
        //   client.RANDOMKEY(function(err, bottleId) {
        //     console.log('bottleId = ' + bottleId);
        //     if (err || !bottleId) {
        //       return resolve({code: 0, msg: '海星'});
        //     }
        //     // 根据漂流瓶id取到漂流瓶完整信息
        //     client.HGETALL(bottleId, function(err, bottle) {
        //       if (err) {
        //         return resolve({code: 0, msg: '漂流瓶破损了...'});
        //       }
        //       // 返回结果， 成功时包含捡到的漂流瓶信息
        //       resolve({code: 1, msg: bottle});
        //       // 从redis中删除该漂流瓶
        //       client.DEL(bottleId);
        //     });
        //   });
        // });
      });
    });
  });
};
