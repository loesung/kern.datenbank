module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var identity = _.crud($.global.get('database')).identity();
    var waitPost = false;
    var post = null;

    if('query' == action || 'search' == action || undefined == action){
        workflow.push(function(callback){
            if('query' == action){
                var func = identity.retriveOne;
                var condition = {id: result[2]};
            } else if('search' == action){
                var func = identity.retrive;
                var condition = {name: result[2]};
            } else {
                var func = identity.retriveAll;
                var condition = false;
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
                        name: post.parsed.name,
                    };
                    identity.create(doc, function(err){
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
                    identity.delete(condition, function(err){
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

