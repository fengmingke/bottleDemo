const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mk');

// 定义漂流瓶模型，并设置数据库存储到bottles集合
const BottleModel = mongoose.model('Bottle', new mongoose.Schema({
  bottle: Array,
  message: Array
}, {
  collection: 'bottles'
}));

// 将用户捡到的漂流瓶改变格式保存
exports.save = function(picker, _bottle) {
  const bottle = {bottle: [], message: []};
  bottle.bottle.push(picker);
  bottle.message.push([_bottle.owner, _bottle.time, _bottle.content]);
  const bm = new BottleModel(bottle);
  return new Promise(function(resolve, reject) {
    bm.save(function(err) {
      if (err) {
        return resolve({code: 0, msg: '获取漂流瓶失败，请重试!'});
      }
      resolve({code: 1});
    });
  });
};

// 获取用户捡到的所有漂流瓶
exports.getAll = function(user) {
  return new Promise(function(resolve, reject) {
    BottleModel.find({'bottle': user}, function(err, bottles) {
      if (err) {
        return resolve({code: 0, msg: '获取漂流瓶列表失败...'});
      }
      resolve({code: 1, msg: bottles});
    });
  });
};

// 获取特定_id的漂流瓶
exports.getOne = function(_id) {
  return new Promise(function(resolve, reject) {
    // 通过id获取特定的漂流瓶
    BottleModel.findById(_id, function(err, bottle) {
      if (err) {
        return resolve({code: 0, msg: '读取漂流瓶失败...'});
      }
      // 成功时返回找到的漂流瓶
      resolve({code: 1, msg: bottle});
    });
  });
};

// 回复特定_id的漂流瓶
exports.reply = function(_id, reply) {
  reply.time = reply.time || Date.now();
  return new Promise(function(resolve, reject) {
    // 通过id找到要回复的漂流瓶
    BottleModel.findById(_id, function(err, _bottle) {
      if (err) {
        return resolve({code: 0, msg: '回复漂流瓶失败...'});
      }
      const newbottle = {};
      newbottle.bottle = _bottle.bottle;
      newbottle.message = _bottle.message;
      // 如果检瓶子的人第一次回复漂流瓶，则在bottle键添加漂流瓶主人
      // 如果已经回复过漂流瓶，则不再添加
      if (newbottle.bottle.length === 1) {
        newbottle.bottle.push(_bottle.message[0][0]);
      }
      // 在message 键添加一条回复信息
      newbottle.message.push([reply.user, reply.time, reply.content]);
      // 更新数据库中该漂流瓶信息
      BottleModel.findByIdAndUpdate(_id, newbottle, function(err, bottle) {
        if (err) {
          return resolve({code: 0, msg: '回复漂流瓶失败...'});
        }
        // 成功时返回更新后的漂流瓶信息
        resolve({code: 1, msg: bottle});
      });
    });
  });
};

// 删除特定_id的漂流瓶
exports.delete = function(_id) {
  return new Promise(function(resolve, reject) {
    // 通过id查找并删除漂流瓶
    BottleModel.findByIdAndRemove(_id, function(err) {
      if (err) {
        return resolve({code: 0, msg: '删除漂流瓶失败...'});
      }
      resolve({code: 1, msg: '删除成功!'});
    });
  });
};
