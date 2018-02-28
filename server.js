const isDev = process.env.NODE_ENV !== 'production';
const mongoose = require('mongoose');
const app = new (require('koa'))();
const { mongo, port = 3001 } = require(`./config${isDev ? '.dev' : ''}`);

app.use(require('koa-static')(__dirname + '/static', {}));
app.use(require('koa-cookie').default());
require('./server/index').init(app);
if (isDev) {
    require('./dev').init(app);
}

mongoose
    .connect(mongo.url)
    .then(() => {
        app.listen(port);
    })
    .catch(console.error);
