// mongodb 模型调用
module.exports = class extends think.Mongo {
  get schema() {
    return {
      bottle: { // 字段名称
        type: 'array'
      },
      message: {
        type: 'array'
      }
    };
  }
  getList() {
    // return this.field('bottle').select();
    return this.select();
  }
};
