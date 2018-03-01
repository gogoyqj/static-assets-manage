const isDev = process.env.NODE_ENV !== 'production';
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const app = new (require('koa'))();
const config = require(`./config${isDev ? '.dev' : ''}`);

const { mongo, port = 3001 } = config;
if (isDev) {
    require('./dev').init(app, config);
}
app.use(require('koa-static')(__dirname + '/static', {}));
app.use(require('koa-body')());
app.use(require('koa-cookie').default());
app.use(async (ctx, next) => {
    ctx.config = config;
    return next(ctx);
});
// 登录状态监测插件
if (fs.existsSync(path.join(__dirname, './login.js'))) {
    app.use(require('./login'));
}
require('./server/index').init(app, config);

mongoose
    .connect(mongo.url)
    .then(() => {
        app.listen(port);
    })
    .catch(console.error);
