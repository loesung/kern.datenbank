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
        if(!input) return '';

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
        var sql = 'SELECT * FROM ' + tablename;
        var condition = conditionExpression(condition);
        if(condition) sql += ' WHERE ' + condition;
        sqldb.all(sql, callback);
    };

    this.selectOne = function(condition, callback){
        self.select(condition, function(err, rows){
            if(null != err)
                callback(err, null);
            else
                callback(null, rows[0]);
        });
    };

    this.delete = function(condition, callback){
        var sql = 'DELETE FROM ' + tablename;
        var condition = conditionExpression(condition);
        if(condition) sql += ' WHERE ' + condition;
        sqldb.run(sql, function(err){
            if($.types.isFunction(callback)) callback(err);
        });
    };

    return this;
};

function database($, _, filename, init, rueckruf){
    var self = this;
    var sqldb = new $.nodejs.sqlite3.Database(filename, function(err, result){
        if(null != err){
            rueckruf(err);
            return;
        };

        if(init){
            $.nodejs.async.eachSeries(
                initSequence,
                function(item, callback){
                    sqldb.run(item, function(err){
                        callback(err);
                    });
                },
                function(err){
                    if(null == err)
                        rueckruf(null, self);
                    else
                        rueckruf(err);
                }
            );
        } else {
            rueckruf(null, self);
        };
    });

    this.table = function(tablename){
        return new table($, _, tablename, sqldb);
    };

    return this;
};

module.exports = function($, _){
    return new function(){
        var self = this;

        this.createDatabase = function(filename, rueckruf){
            new database($, _, filename, true, rueckruf);
        };

        this.loadDatabase = function(filename, rueckruf){
            new database($, _, filename, false, rueckruf);
        };
       
        return this;
    };
};
