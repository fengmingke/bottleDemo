const Base = require('./base.js');
const redis = require('../other/redis.js');
// 原生调用方式
// const mongodb = require('../other/mongodb.js');

module.exports = class extends Base {
  indexAction() {
    this.body = 'This is a bottle demo.';
  }
  // 实例化，避免重复初始化链接mongodb
  get bottleModel() {
    if (!this._bottleModel) {
      this._bottleModel = think.mongo('bottle');
    }
    return this._bottleModel;
  }
  // 显示所有漂流瓶
  async showBottleAction() {
    const data = await this.bottleModel.getList();
    this.body = data;
  }
  // 检一个漂流瓶
  async pickAction() {
    // console.log(this.ctx.query);
    const type = this.get('type');
    const user = this.get('user');
    if (!user) {
      return this.json({code: 0, msg: '信息不完整'});
    }
    if (type && (['male', 'female'].indexOf(type) === -1)) {
      return this.json({code: 0, msg: '类型错误'});
    }
    const result = await redis.pick(this.ctx.query);
    // console.log(result);
    if (result.code === 1) {
      // 框架扩展调用
      const bt = {bottle: [], message: []};
      bt.bottle.push(user);
      bt.message.push([result.msg.owner, result.msg.time, result.msg.content]);
      await this.bottleModel.add(bt);
      // const insertId = await this.bottleModel.add(bt);
      // console.log(insertId);

      // 原生调用方式
      // const res = await mongodb.save(user, result.msg);
      // console.log(res);
      // if (res.code === 0) {
      //   return this.json(res);
      // }
    }
    this.json(result);
  }
  // 获取一个用户所有的漂流瓶
  async userAction() {
    const name = this.get('name');
    const result = await this.bottleModel.where({'bottle': name}).select();
    // console.log(result);
    // 原生调用方式
    // const result = await mongodb.getAll(name);
    if (think.isEmpty(result)) {
      return this.json({code: 0, msg: '漂流瓶为空...'});
    }
    this.json({code: 1, msg: result});
  }
  // 获取特定_id的漂流瓶
  async getIdAction() {
    const _id = this.get('_id');
    const result = await this.bottleModel.where({'_id': _id}).find();
    // console.log(result);
    // 原生调用方式
    // const result = await mongodb.getOne(_id);
    if (think.isEmpty(result)) {
      return this.json({code: 0, msg: '读取漂流瓶失败...'});
    }
    this.json({code: 1, msg: result});
  }
  // 回复特定_id的漂流瓶
  async replyAction() {
    // console.log(this.ctx.request.body);
    const _id = this.get('_id');
    const user = this.post('user');
    const content = this.post('content');
    if (!(user && content)) {
      return this.json({code: 0, msg: '回复信息不完整!'});
    }
    const reply = this.ctx.request.body.post;
    reply.time = reply.time || Date.now();
    // 通过id找到要回复的漂流瓶
    const _bottle = await this.bottleModel.where({'_id': _id}).find();
    // console.log(_bottle);
    if (think.isEmpty(_bottle)) {
      return this.json({code: 0, msg: '回复漂流瓶失败...'});
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
    const affectedRows = await this.bottleModel.where({'_id': _id}).update(newbottle);
    // console.log("affectedRows = " + affectedRows);
    if (!affectedRows) {
      return this.json({code: 0, msg: '回复漂流瓶失败...'});
    }
    // 成功时返回更新后的漂流瓶信息
    const result = await this.bottleModel.where({'_id': _id}).find();
    // console.log(result);
    // 原生调用方式
    // const result = await mongodb.reply(_id, this.ctx.request.body.post);
    this.json({code: 1, msg: result});
  }
  // 删除特定_id的漂流瓶
  async deleteAction() {
    const _id = this.get('_id');
    const result = await this.bottleModel.where({'_id': _id}).delete();
    // console.log(result);
    // 原生调用方式
    // const result = await mongodb.delete(_id);
    if (!result) {
      return this.json({code: 0, msg: '删除漂流瓶失败...'});
    }
    this.json({code: 1, msg: '删除成功!'});
  }
  // 扔一个漂流瓶
  async throwAction() {
    // console.log(this.ctx.request.body);
    const owner = this.post('owner');
    const type = this.post('type');
    const content = this.post('content');
    if (!(owner && type && content)) {
      if (type && (['male', 'female'].indexOf(type) === -1)) {
        return this.json({code: 0, msg: '类型错误'});
      }
      return this.json({code: 0, msg: '信息不完整'});
    }
    const result = await redis.throw(this.ctx.request.body.post);
    // console.log(result);
    this.json(result);
  }
  // 扔回海里
  async throwBackAction() {
    // console.log(this.ctx.request.body);
    const message = this.ctx.request.body.post;
    const name = this.post('user');
    await this.bottleModel.where({'bottle': name, 'message': [message.owner, message.time, message.content]}).delete();
    // const res = await this.bottleModel.where({'bottle': name, 'message': [message.owner, message.time, message.content]}).delete();
    // console.log(res);
    const bottle = {owner: message.owner, type: message.type, time: message.time, content: message.content};
    const result = await redis.throwBack(bottle);
    // console.log(result);
    this.json(result);
  }
};
