var router = [
    [/^\/identity\/search\/id\/?$/,],
    [/^\/identity\/search\/keyword\/?$/, ],
    [/^\/codebook\/add\/?$/, ],
    [/^\/codebook\/edit\/?$/, ],
    [/^\/codebook\/remove\/?$/, ],
    [/^\/codebook\/query\/?$/, ],

];

module.exports = function(packet){
    var workflow = [];
    var database = $.global.get('database');

    database.table('identity').select(
        [{'id': 1, 'p': {$gt: 2, $lt: 10}}, {'id':3}]
    );

    $.nodejs.async.waterfall(workflow, function(err, result){
    packet.end('');
    });
};
