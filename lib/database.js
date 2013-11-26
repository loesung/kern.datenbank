var initSequence = [
    'CREATE TABLE identity(id TEXT, data TEXT)',
    'CREATE TABLE codebook(id TEXT, credential TEXT, epoch INTEGER, decrypt TEXT, origin TEXT, trust INTEGER)',
];

function conditionExpression(input, context, eltern){
    var output = null;
    if($.types.isArray(input)){
        output = [];
        for(var i in input){
            output.push(
                '(' + conditionExpression(input[i]) + ')'
            );
        };
        return output.join(' OR ');
    } else if($.types.isObject(input)){
        output = [];
        for(var i in input){
            output.push(
                '(' + conditionExpression(input[i], i, context) + ')'
            );
        };
        return output.join(' AND ');
    } else {
        if($.types.isString(input)){
            input = '"' + encodeURIComponent(input) + '"';
        };

        switch(context){
            case '$gt':
                return eltern + '>' + input;
            case '$lt':
                return eltern + '<' + input;
            default:
                return context + '=' + input;
        };
    };
};

function table($, _, tablename, sqldb){
    var self = this;

    this.insert = function(sets, callback){
        var fields = [], values = [], sql = '';

        for(var key in sets){
            fields.push('`' + key + '`');
            values.push('"' + encodeURIComponent(sets[key]) + '"');
        };

        sql = 'INSERT INTO ' + tablename
            + '(' + fields.join(', ') + ')'
            + ' VALUES(' + values.join(', ') + ')'
        ;
        
        sqldb.run(sql, function(err){
            if($.types.isFunction(callback)) callback(err);
        });
    };

    this.select = function(condition, callback){
        console.log(conditionExpression(condition));
    };

    return this;
};

function database($, _, filename, init){
    var self = this;
    var sqldb = new $.nodejs.sqlite3.Database(filename);

    if(init){
        this.initialize = function(rueckruf){
            $.nodejs.async.eachSeries(
                initSequence,
                function(item, callback){
                    sqldb.run(item, function(err){
                        callback(err);
                    });
                },
                function(err){
                    rueckruf(err);
                    delete self.initialize;
                }
            );
        };
    };

    this.table = function(tablename){
        return new table($, _, tablename, sqldb);
    };

    return this;
};

module.exports = function($, _){
    return new function(){
        var self = this;

        this.createDatabase = function(filename, rueckruf){
            var db = new database($, _, filename, true);
            db.initialize(function(err, result){
                if(null != err)
                    rueckruf(err);
                else
                    rueckruf(null, db);
            });
        };

        this.loadDatabase = function(filename, rueckruf){
            var db = new database($, _, filename, false);
            rueckruf(null, db);
        };
       
        return this;
    };
};
