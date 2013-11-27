module.exports = function(packet, result, post, rueckruf){
    var action = result[1],
        workflow = [];
    
    var codebook = _.crud($.global.get('database')).codebook();

    if(['add', 'edit', 'remove'].indexOf(action) >= 0){
    } else {
        workflow.push(function(callback){
            codebook.retriveOne(result[2], function(err, row){
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
        console.log('Codebook query result', result); 
        rueckruf(null, result);
    });
};
