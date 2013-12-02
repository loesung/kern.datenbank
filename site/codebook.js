module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var codebook = _.crud($.global.get('database')).codebook();
    var waitPost = false;
    var post = null;

    if('query' == action || 'search' == action){
        workflow.push(function(callback){
            if('query' == action){
                var func = codebook.retriveOne;
                var condition = {id: result[2]};
            } else {
                var func = codebook.retrive;
                var condition = {buddy: result[2]};
            };
            func(condition, function(err, row){
                if(null != err)
                    callback(err);
                else
                    callback(null, JSON.stringify(row));
            });
        });
    } else {
        waitPost = true;
        switch(action){
            case 'add':
                workflow.push(function(callback){
                    var doc = {
                        id: post.parsed.id,
                        buddy: post.parsed.buddy,
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
            case 'remove':
                workflow.push(function(callback){
                    var condition = {
                        'id': result[2],
                    };
                    codebook.delete(condition, function(err){
                        if(null != err)
                            callback(404);
                        else
                            callback(null);
                    });
                });
                break;
            case 'edit':
                workflow.push(function(callback){
                    var condition = {
                        'id': result[2],
                    };
                    var sets = post.parsed;
                    codebook.update(condition, sets, function(err){
                        if(null != err)
                            callback(404);
                        else
                            callback(null);
                    });
                });
                break;
            default:
                workflow.push(function(callback){
                    callback(400);
                });
                break;
        };
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
