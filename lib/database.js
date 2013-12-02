var initSequence = [
    'CREATE TABLE identity(id TEXT, name TEXT)',
    'CREATE TABLE codebook(id TEXT, buddy TEXT, credential TEXT, epoch INTEGER, decrypt TEXT, origin TEXT, trust INTEGER)',
    'CREATE TABLE queue(id TEXT, tag TEXT, data TEXT, timestamp INTEGER)',
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

    this.select = function(condition, columns, callback){
        var colstr = '';
        if($.types.isArray(columns))
            colstr = '`' + columns.join('`, `') + '`';
        else
            colstr = '*';
        var sql = 'SELECT ' + colstr + ' FROM ' + tablename;
        var condition = conditionExpression(condition);
        if(condition) sql += ' WHERE ' + condition;
        String(sql).DEBUG();
        sqldb.all(sql, function(err, rows){
            for(var i in rows)
                for(var j in rows[i])
                    rows[i][j] = decodeURIComponent(rows[i][j]);
            callback(err, rows);
        });
    };

    this.selectOne = function(condition, columns, callback){
        self.select(condition, columns, function(err, rows){
            if(null != err)
                callback(err, null);
            else {
                callback(null, rows.shift());
            };
        });
    };

    this.update = function(condition, sets, callback){
        var fields = [], values = [];
        var sql = 'UPDATE ' + tablename + ' SET ';
        var condition = conditionExpression(condition);
        var setParts = [];
        for(var key in sets){
            setParts.push(
                '`' + key + '`="'
                + encodeURIComponent(sets[key]) + '"'
            );
        };
        sql += setParts.join(', ');
        if(condition) sql += ' WHERE ' + condition;
        sqldb.run(sql, function(err){
            if($.types.isFunction(callback)) callback(err);
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
