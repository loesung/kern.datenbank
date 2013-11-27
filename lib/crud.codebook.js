/*
 * id TEXT,
 * credential TEXT,
 * epoch INTEGER,
 * decrypt TEXT,
 * origin TEXT,
 * trust INTEGER
 */
function filter(what){
    var def = {
        id: function(i){ return /^[0-9a-f]{0,64}$/.test(i); },
    };

    return (function(){
        return function(i){
            try{
                return def[what](i);
            } catch(e){
                return false;
            };
        };
    })();
};

module.exports = function($, _, CRUD, sqldb){
    var self = this;
    var config = {
        create: {},
        retrive: {},
        update: {},
        delete: {},

        db: {
            table: 'codebook',
        },
    };

    // require unique test, the condition is derived by following function.
    create.unique = function(doc){
        if(!(
            filters('id')(doc.id)
        ))
            return false;

        return {
            id: doc.id,
        };
    };

    // to insert a new record, firstly use following function to derive
    // the needed format.
    create.gen = function(doc){
        
    };

    return new CRUD($, _, sqldb, config);
};
