const path = require('path');

module.exports = [
    // {
    //     entry:'./dist/server/index.js',
    //     output:{
    //         filename:'./server.js',
    //         path: path.resolve(__dirname, 'build')
    //     },
    //     target:'node'
    // },
    {
        entry:'./dist/client/scripting/index.js',
        output:{
            filename:'client.js',
            path: path.resolve(__dirname, './dist/client'),
        },
        target:'web'
    }
]