module.exports = {
    mongo: {
        url: 'mongodb://localhost/asset'
    },
    schema: {
        maxDescriptionLength: 200,
        maxDetailLength: 200
    },
    assetServer: {
        path: require('path').join(__dirname, 'static', 'static', 'asset')
    }
};