var initSequence = [
    'CREATE TABLE identity(id TEXT, data TEXT)',
    'CREATE TABLE codebook(id TEXT, credential TEXT, epoch INTEGER, decrypt TEXT, origin TEXT, trust INTEGER)',
];

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

    return this;
};

module.exports = function($, _){
    return new function(){
        var self = this;

        this.createDatabase = function(filename, rueckruf){
            $.nodejs.fs.exists(filename, function(exists){

                if(exists){
                    rueckruf(true);
                    return;
                };

                var db = new database($, _, filename, true);
                db.initialize(function(err, result){
                    if(null != err)
                        rueckruf(err);
                    else
                        rueckruf(null, db);
                });

            });
        };

        this.loadDatabase = function(filename, rueckruf){
            var db = new database($, _, filename, false);
            rueckruf(null, db);
        };
       
        return this;
    };
};
