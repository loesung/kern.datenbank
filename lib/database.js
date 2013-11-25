function database($, _, filename){
    var self = this;
    var sqldb = new $.nodejs.sqlite3.Database(filename);

    this.initialize = function(callback){
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

                self.loadDatabase(filename, function(err, db){
                    if(null != err){
                        rueckruf(err);
                        return;
                    };

                    db.initialize(function(err, result){
                        if(null != err)
                            rueckruf(err);
                        else
                            rueckruf(null, db);
                    });
                });

            });
        };

        this.loadDatabase = function(filename, rueckruf){
            var db = new database($, _, filename);
            rueckruf(null, db);
        };
       
        return this;
    };
};
