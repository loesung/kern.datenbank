module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var codebook = _.crud($.global.get('database')).codebook();
    var waitPost = false;
    var post = null;

    if(['add', 'edit', 'remove'].indexOf(action) >= 0){
        waitPost = true;
        switch(action){
            case 'add':
                workflow.push(function(callback){
                    var doc = {
                        id: post.parsed.id,
                        origin: post.parsed.origin,
                        credential: post.parsed.credential,
                        decrypt: post.parsed.decrypt,
                    };
                    codebook.create(doc, function(err){
                        if(null != err){
                            callback(422);
                        } else
                            callback(null);
                    });
                });
                break;
            default:
                break;
        };
    } else {
        workflow.push(function(callback){
            var condition = {
                'id': result[2],
            };
            codebook.retriveOne(condition, function(err, row){
                if(null == err)
                    callback(err);
                else
                    callback(null, JSON.stringify(row));
            });
        });
    };

    function doJob(p){
        post = p;
        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err){
                rueckruf(err);
                return;
            };
            rueckruf(null, result);
        });
    };
    if(waitPost){
        packet.on('ready', function(post){
            doJob(post);
        });
    } else {
        doJob(null);
    };
};
