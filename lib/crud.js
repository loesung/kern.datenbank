/*
 * CRUD operations for an abstract type of document
 *
 * Noticing that for given table in database, there is always a lot of similar
 * boring sequences to go, when we want to CREATE, RETRIVE, UPDATE, or DELETE
 * items. So here we do things together.
 *
 * 'config' in initializing a CRUD instance should like:
 *  {
 *      create: {
 *          unique: [FUNCTION], // get 'condition' to check if it is unique.
 *          generate: [FUNCTION], // given input, generate Doc
 *      },
 *      retrive: {
 *      },
 *      update: {
 *      },
 *      delete: {
 *      },
 *      db: {
 *          table: '[TABLE-NAME]',
 *      },
 *  }
 */
function CRUD($, _, sqldb, config){
    var self = this;
    var table = sqldb.table(config.db.table);

    this.create = function(doc, rueckruf){
        var cfg = config.create;
        var workflow = [];

        if(undefined != cfg.unique) workflow.push(function(callback){
            var uniqueCondition = cfg.unique(doc);
            table.select(uniqueCondition, function(err, rows){
                if(null == err){
                    if(rows.length > 0)
                        callback(true);
                    else
                        callback(null);
                } else
                    callback(true); 
            });
        });

        workflow.push(function(callback){
            var sets = cfg.gen(doc);
            table.insert(sets, callback);
        });

        $.nodejs.async.waterfall(workflow, function(err){
            if(null == err)
                rueckruf(null);
            else
                rueckruf(err);
        });
    };

    this.retrive = function(condition, rueckruf){
        var cfg = config.retrive;
        var workflow = [];
        
    };

    this.update = function(condition, sets, rueckruf){
    };

    this.delete = function(condition, rueckruf){
    };

    return this;
};


/* export interfaces */
var required = {
    codebook: require('./crud.codebook.js'),
};
module.exports = function($, _, sqldb){
    return new function(){
        var self = this;

        this.codebook = function(){
            return required.codebook($, _, CRUD, sqldb);
        };
    };
};
