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

    database.table('identity').insert({id: 'abcdefg', data: 'abcdefghijklmn"=\''});

    $.nodejs.async.waterfall(workflow, function(err, result){
    packet.end('');
    });
};
