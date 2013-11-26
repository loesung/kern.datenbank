_ = (function(){
    var self = this;

    this.database = require('./database.js')($, this);
    this.crud = function(sqldb){
        return require('./crud.js')($, self, sqldb);
    };

    return this;
})();
