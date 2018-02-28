const mongoose = require('mongoose');
const _ = require('lodash');
const mongooseCommonPlugin = require('mongoose-common-plugin');

const config = require('../../config');

const Asset = new mongoose.Schema({
    id: { // id
        type: String,
        required: true,
        index: true
    },
    name: { // 名称
        type: String,
        required: true,
        validate: val => _.isString(val) && val.length <= config.schema.maxDescriptionLength
    },
    description: { // 描述信息
        type: String,
        default: '',
        validate: val => _.isString(val) && val.length <= config.schema.maxDescriptionLength
    },
    owner: { // 上传者
        type: String,
        required: true
    }
});

Asset.plugin(mongooseCommonPlugin, { object: 'asset' });

module.exports = mongoose.model('Asset', Asset);
