module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var codebook = _.crud($.global.get('database')).codebook();

    if(['add', 'edit', 'remove'].indexOf(action) >= 0){
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

    $.nodejs.async.waterfall(workflow, function(err, result){
        if(null != err){
            rueckruf(err);
            return;
        };
        rueckruf(null, result);
    });
};
