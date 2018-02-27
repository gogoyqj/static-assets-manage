var app = new (require('koa'))();
var port = 3001;
var router = require('koa-router')();

require('./server/index').init(app, router);
if (process.env.NODE_ENV !== 'production') {
    require('./dev').init(app, router);
}
app.use(require('koa-static')(__dirname + '/static', {}));
app.use(router.middleware());

app.listen(port);
