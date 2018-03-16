const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const base64Img = require('base64-img');
const moment = require('moment');
const { Assets } = require('../models');
const {
    assetPrefix,
    mailAssetPrefix = assetPrefix
} = require('../../config.common');

// 查询所有资源
const list = async (ctx) => {
    let { pageSize, current = 1, sortField, sortOrder, filters } = ctx.query;
    try {
        sortField = sortField || 'created_at';
        try {
            filters = JSON.parse(filters);
            Object
                .keys(filters)
                .forEach((key) => {
                    filters[key] = new RegExp(filters[key]);
                });
        } catch (e) {
            filters = {};
        }
        const [assets, total] = await Promise.all([
            Assets.find(filters)
            .limit(Number(pageSize) || 10)
            .skip(pageSize * (current - 1))
            .lean()
            .sort(`${sortOrder === 'ascend' ? '+' : '-'}${sortField}`)
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
    const { request, cookie, config } = ctx;
    const {
        body: {
            name,
            description = '',
            file: {
                name: filename,
                content
            },
            mail
        }
    } = request;
    const { userName } = cookie;
    const {
        assetServer: {
            path: assetDir,
            mailPath: mailDir = assetDir
        }
    } = config;
    try {
        const ext = mail ? '.png' : path.extname(filename);
        const ymd = mail ? moment().format('YYYYMMDD') : Date.now();
        const firstKey = mail ? filename : userName;
        // 加密
        let encrypted = '';
        const cip = crypto.createCipher('blowfish', 'asset');
        encrypted += cip.update(`${firstKey}_${ymd}`, 'binary', 'hex');
        encrypted += cip.final('hex');
        // 解密
        // let decrypted = '';
        // const decipher = crypto.createDecipher('blowfish', '123');
        // decrypted += decipher.update(encrypted, 'hex', 'binary');
        // decrypted += decipher.final('binary');
        const assetId = `${encrypted}${ext}`;
        if (mail) {
            // save as file
            base64Img.imgSync(content, `${mailDir}/${ymd}`, encrypted);
            ctx.body = {
                code: 0,
                data: {
                    url: `${mailAssetPrefix}${ymd}/${assetId}`
                }
            };
        } else {
            const res = await Assets.insertMany({
                id: assetId,
                name,
                owner: userName,
                description
            });
            // save as file
            base64Img.imgSync(content, assetDir, encrypted);
            ctx.body = {
                code: 0,
                data: res
            };
        }
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
        const last = await Assets.findOne(condition);
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
        const { request, cookie, config } = ctx;
        const { assetServer: { path: assetDir } } = config;
        const { userName } = cookie;
        const {
            body: {
                id
            }
        } = request;
        if (id === undefined) {
            throw Error('asset id invalid');
        }
        const condition = { id };
        const last = await Assets.findOne(condition);
        if (!last) {
            throw Error(`asset ${id} not exists`);
        }
        const { owner } = last;
        if (owner !== userName) {
            throw Error(`${userName} can not remove ${owner}'s asset`);
        }
        // remove file
        const assetFile = path.join(assetDir, id);
        if (fs.existsSync(assetFile)) {
            fs.unlinkSync(assetFile);
        }
        await Assets.remove(condition);
        ctx.body = {
            code: 0,
            data: {
                id
            }
        };
    } catch (err) {
        ctx.body = {
            code: 500,
            message: err.message
        };
    }
};

module.exports = { list, add, update, remove };
