const mongoose = require('mongoose');
const _ = require('lodash');
const mongooseCommonPlugin = require('mongoose-common-plugin');

const config = require('../../config');

const Log = new mongoose.Schema({
    id: { // id
        type: String,
        required: true,
        index: true
    },
    assetId: { // 关联资源 id
        type: String,
        required: true
    },
    detail: { // 日志主体
        type: String,
        required: true,
        validate: val => _.isString(val) && val.length <= config.schema.maxDetailLength
    },
    stamp: { // 时间
        type: Date,
        required: true,
        default: Date.now
    }
});

Log.plugin(mongooseCommonPlugin, { object: 'log' });

module.exports = mongoose.model('Log', Log);
