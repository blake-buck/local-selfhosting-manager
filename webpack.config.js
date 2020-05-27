const path = require('path');

module.exports = [
    {
        entry:'./dist/client/scripting/index.js',
        output:{
            filename:'client.js',
            path: path.resolve(__dirname, './dist/client'),
        },
        target:'web'
    }
]