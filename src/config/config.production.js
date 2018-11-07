// production config, it will load in production enviroment
module.exports = {
  startServerTimeout: 5000, // 将超时时间改为 5s
  workers: 0,
  host: '127.0.0.1',
  port: 8362,
  stickyCluster: false
};
