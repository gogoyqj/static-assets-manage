const isDev = process.env.NODE_ENV !== 'production';
const mongoose = require('mongoose');
const app = new (require('koa'))();
const config = require(`./config${isDev ? '.dev' : ''}`);

const { mongo, port = 3001 } = config;
app.use(require('koa-static')(__dirname + '/static', {}));
app.use(require('koa-body')());
app.use(require('koa-cookie').default());
app.use(async (ctx, next) => {
    ctx.config = config;
    return next(ctx);
});
require('./server/index').init(app, config);
if (isDev) {
    require('./dev').init(app, config);
}

mongoose
    .connect(mongo.url)
    .then(() => {
        app.listen(port);
    })
    .catch(console.error);
