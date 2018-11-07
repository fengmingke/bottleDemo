const fileCache = require('think-cache-file');
const redisCache = require('think-cache-redis');
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const cookie = require('think-session-cookie');
const redisSession = require('think-session-redis');
const mysql = require('think-model-mysql');
const {Console, File, DateFile} = require('think-logger3');
const path = require('path');
const isDev = think.env === 'development';

/**
 * cache adapter config
 * @type {Object}
 */
exports.cache = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000 // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: path.join(think.ROOT_PATH, 'runtime/cache'), // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000 // gc interval
  },
  redis: {
    handle: redisCache,
    port: 6379,
    host: '127.0.0.1',
    password: ''
  }
};

/**
 * model adapter config
 * @type {Object}
 */
exports.model = {
  type: 'mongo', // 默认使用的类型，调用时可以指定参数切换
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => think.logger.info(msg)
  },
  mysql: {
    handle: mysql,
    database: '',
    prefix: 'think_',
    encoding: 'utf8',
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root',
    dateStrings: true
  },
  mongo: {
    host: '127.0.0.1', // 可以支持多个host ['127.0.0.1', '10.16.1.2']
    port: 27017, // 可以支持多个port [27017, 27018]
    // name: 'bridgetest',
    user: '',
    password: '',
    prefix: '',
    database: 'mk', // 数据库名称
    encoding: 'utf8',
    // nums_per_page: 10,
    pageSize: 20 // 设置默认每页为 20 条
    // cache: {
    //   on: true,
    //   type: '',
    //   timeout: 3600
    // },
    // options: {
    //   replicaSet: 'mgset-3074013',
    //   authSource: 'admin'
    // }
  },
  mongoose: {
    host: '127.0.0.1',
    port: 27017,
    user: '',
    password: '',
    database: 'test',
    useCollectionPlural: false,
    // connectionString: 'mongodb://user:pass@localhost:port/database',
    options: {
      // config: {
      //   autoIndex: false
      // }
    }
  }
};

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
  type: 'file', // 'cookie'|'redis'
  common: {
    cookie: {
      name: 'thinkjs',
      // keys: ['werwer', 'werwer'],
      // signed: true,
      signed: false,
      autoUpdate: false, // auto update cookie when maxAge is set
      // maxAge: '',
      // expires: '',
      path: '/', // a string indicating the path of the cookie
      // domain: '',
      // secure: false,
      httpOnly: true,
      sameSite: false,
      overwrite: false
    }
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
  },
  cookie: {
    handle: cookie,
    cookie: {
      encrypt: false // encrypt cookie data
    }
  },
  redis: {
    handle: redisSession,
    maxAge: 3600 * 1000, // session timeout, if not set, session will be persistent.
    autoUpdate: false // update expired time when get session, default is false
  }
};

/**
 * view adapter config
 * @type {Object}
 */
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  nunjucks: {
    handle: nunjucks,
    // beforeRender: () => {}, // 模板渲染预处理
    beforeRender(env, nunjucks, config) { // 模板渲染预处理
      // env.addFilter('utc', time => (new Date(time)).toUTCString());
    },
    options: { // 模板引擎额外的配置参数
      autoescape: true
      // tags: { // 修改定界符相关的参数
      //   blockStart: '<%',
      //   blockEnd: '%>',
      //   variableStart: '<$',
      //   variableEnd: '$>',
      //   commentStart: '<#',
      //   commentEnd: '#>'
      // }
    }
  }
};

/**
 * logger adapter config
 * @type {Object}
 */
exports.logger = {
  type: isDev ? 'console' : 'dateFile',
  console: {
    handle: Console
  },
  file: {
    handle: File,
    backups: 10, // max chunk number
    absolute: true,
    maxLogSize: 50 * 1024, // 50M
    filename: path.join(think.ROOT_PATH, 'logs/app.log')
  },
  dateFile: {
    handle: DateFile,
    level: 'ALL',
    absolute: true,
    pattern: '-yyyy-MM-dd',
    alwaysIncludePattern: true,
    filename: path.join(think.ROOT_PATH, 'logs/app.log')
  }
};
