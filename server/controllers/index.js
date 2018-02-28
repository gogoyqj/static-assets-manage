const { Assets } = require('../models');

// 查询所有资源
const list = async (ctx) => {
    const { pageSize = 10, current = 1 } = ctx.query;
    try {
        const [assets, total] = await Promise.all([
            Assets.find({})
            .limit(pageSize)
            .skip(pageSize * (current - 1))
            .lean()
            // .sort('-created_at')
            .exec(),
            Assets.count({})
        ]);

        ctx.body = {
            code: 0,
            data: {
                total,
                current,
                pageSize,
                data: assets
            }
        };
    } catch (err) {
        ctx.body = {
            code: 500,
            message: err.message
        };
    }
};

const add = async (ctx) => {
    const { request, cookie } = ctx;
    const {
        body: {
            name,
            description = ''
        }
    } = request;
    const { userName } = cookie;
    try {
        await Assets.insertMany({
            id: Date.now(),
            name,
            owner: userName,
            description
        });
    } catch (err) {
        ctx.body = {
            code: 500,
            message: err.message
        };
    }
};

const update = async (ctx) => {
    const {
        body: {
            id,
            name,
            description
        }
    } = ctx.request;
    try {
        if (id === undefined) {
            throw Error('asset id invalid');
        }
        const condition = { id };
        const last = await Assets.find(condition);
        if (!last) {
            throw Error(`asset ${id} not exists`);
        }
        const { name: lastName, description: lastDescription } = last;
        let message = [];
        if (name !== lastName) {
            message.push(`update name "${lastName}" to "${name}"`);
        }
        if (description !== lastDescription) {
            message.push(`update description "${lastDescription}" to "${description}"`);
        }
        message = message.join(',');
        if (!message.length) {
            throw Error('nothing changed');
        }
        await Assets.updateOne(condition, {
            $set: {
                name,
                description
            }
        });
    } catch (err) {
        ctx.body = {
            code: 500,
            message: err.message
        };
    }
};

const remove = async (ctx) => {
    try {
        const {
            body: {
                id
            }
        } = ctx.request;
        if (id === undefined) {
            throw Error('asset id invalid');
        }
        const condition = { id };
        const last = await Assets.find(condition);
        if (!last) {
            throw Error(`asset ${id} not exists`);
        }
        await Assets.remove(condition);
    } catch (err) {
        ctx.body = {
            code: 500,
            message: err.message
        };
    }
};

module.exports = { list, add, update, remove };
