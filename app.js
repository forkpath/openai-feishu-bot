const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const morgan = require("./src/config/morgan");
const { errorConverter, errorHandler } = require("./src/middleware/error.mw");
const ApiError = require("./src/util/api-err");
const routes = require("./src/routes");
const db = require("./src/models");

const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// 设置安全性 HTTP 标头
app.use(helmet());

// 解析 JSON 请求正文
app.use(express.json());

// 解析 urlencode 请求正文
app.use(express.urlencoded({ extended: true }));

// 防xss攻击
app.use(xss());

// gzip压缩
app.use(compression());

// 启用cors
app.use(cors());
app.options('*', cors());

// 启动前，同步数据库
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


// 路由入口
app.use('/', routes)

// 为任何未知 API 请求发回 404 错误
app.use((req, res, next) => {
  console.log(req);
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// 将错误转换为 ApiError
app.use(errorConverter);

// 处理错误
app.use(errorHandler);

module.exports = app;
