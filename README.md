
## [ThinkJS](http://www.thinkjs.org)
## 基于thinkjs框架 + redis + mongodb 搭建漂流瓶服务demo

## 安装依赖模块(进入根目录)
npm install

## 本地环境服务运行
npm start

## Deploy with pm2
Use pm2 to deploy app on production enviroment.

## 部署到Linux 环境后，进入项目根目录下运行 以下命令
## node项目 便在生存环境下启动
pm2 start pm2.json
##
pm2 startOrReload pm2.json
