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

    function flowWork(workflow, callback){
        $.nodejs.async.waterfall(workflow, function(err, e1, e2, e3){
            if(null == err)
                callback(null, e1, e2, e3);
            else
                callback(err);
        });
    };

    this.create = function(doc, rueckruf){
        var cfg = config.create;
        var workflow = [];

        if(undefined != cfg.unique) workflow.push(function(callback){
            var uniqueCondition = cfg.unique(doc);
            if(!$.types.isObject(uniqueCondition)){
                callback('bad-input');
                return;
            };
            table.select(uniqueCondition, true, function(err, rows){
                if(null == err){
                    if(rows.length > 0)
                        callback('duplicate');
                    else
                        callback(null);
                } else
                    callback('database-error'); 
            });
        });

        workflow.push(function(callback){
            var sets = cfg.gen(doc);
            if(!$.types.isObject(sets)){callback('bad-input'); return;};
            table.insert(sets, callback);
        });

        flowWork(workflow, rueckruf);
    };

    this.retrive = function(condition, rueckruf){
        var cfg = config.retrive;
        var workflow = [];

        workflow.push(function(callback){
            var bedingungen = cfg.condition(condition);
            if(!$.types.isObject(bedingungen)){
                callback('bad-input');
                return;
            };
            table.select(bedingungen, cfg.columns, callback);
        });

        flowWork(workflow, rueckruf);
    };

    this.retriveAll = function(condition, rueckruf){
        var cfg = config.retrive;
        var workflow = [];

        workflow.push(function(callback){
            table.select(false, cfg.columns, callback);
        });

        flowWork(workflow, rueckruf);
    };

    this.retriveOne = function(condition, rueckruf){
        var cfg = config.retriveOne;
        var workflow = [];

        console.log('Single query at table [' + config.db.table + '].');
        
        workflow.push(function(callback){
            var bedingungen = cfg.condition(condition);
            if(!$.types.isObject(bedingungen)){
                callback('bad-input');
                return;
            };
            table.selectOne(bedingungen, cfg.columns, callback);
        });

        flowWork(workflow, rueckruf);
    };

    this.update = function(condition, sets, rueckruf){
        var cfg = config.update;
        var workflow = [];
        
        workflow.push(function(callback){
            var bedingungen = cfg.condition(condition);
            var newSets = cfg.gen(sets);
            if(!($.types.isObject(bedingungen) && $.types.isObject(newSets))){
                callback('bad-input');
                return;
            };
            table.update(bedingungen, newSets, callback);
        });

        flowWork(workflow, rueckruf);
    };

    this.delete = function(condition, rueckruf){
        var cfg = config.delete;
        var workflow = [];
        
        workflow.push(function(callback){
            var bedingungen = cfg.condition(condition);
            if(!$.types.isObject(bedingungen)){
                callback('bad-input');
                return;
            };
            table.delete(bedingungen, callback);
        });

        flowWork(workflow, rueckruf);
    };

    return this;
};


/* export interfaces */
var required = {
    codebook: require('./crud.codebook.js'),
    queue: require('./crud.queue.js'),
    identity: require('./crud.identity.js'),
};
module.exports = function($, _, sqldb){
    return new function(){
        var self = this;

        this.codebook = function(){
            return required.codebook($, _, CRUD, sqldb);
        };

        this.queue = function(){
            return required.queue($, _, CRUD, sqldb);
        };

        this.identity = function(){
            return required.identity($, _, CRUD, sqldb);
        };
    };
};
