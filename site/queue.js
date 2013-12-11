module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var queue = _.crud($.global.get('database')).queue();
    var waitPost = false;
    var post = null;

    if('query' == action || 'search' == action){
        workflow.push(function(callback){
            if('query' == action){
                var func = queue.retriveOne;
                var condition = {id: result[2]};
            } else {
                var func = queue.retrive;
                var condition = {tag: result[2]};
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
                    var comment = post.parsed.comment;
                    if(!$.types.isString(comment)) comment = '';
                    var doc = {
                        tag: post.parsed.tag,
                        comment: comment,
                        data: post.parsed.data,
                    };
                    queue.create(doc, function(err, e1){
                        if(null != err){
                            callback(422);
                        } else {    
                            var output = null;
                            if($.types.isObject(e1))
                                output = JSON.stringify(e1);
                            callback(null, output);
                        };
                    });
                });
                break;
            case 'remove':
                workflow.push(function(callback){
                    var condition = {
                        'id': result[2],
                    };
                    queue.delete(condition, function(err){
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
