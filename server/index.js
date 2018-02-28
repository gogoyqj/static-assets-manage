const { list, add, update, remove } = require('./controllers');

module.exports = {
    init: (app) => {
        const router = require('koa-router')({ prefix: '/api' });

        router
            .get('/asset/list', list)
            .post('/asset/add', add)
            .post('/asset/update', update)
            .post('/asset/remove', remove);

        app.use(router.routes());
    }
};