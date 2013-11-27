_ = (function(){
    var self = this;
    var required = {
        crud: require('./crud.js'),
        database: require('./database.js'),
    };

    this.database = required.database($, this);
    this.crud = function(sqldb){
        return required.crud($, self, sqldb);
    };

    return this;
})();
