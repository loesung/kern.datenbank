/*
 * id TEXT,
 * credential TEXT,
 * epoch INTEGER,
 * decrypt TEXT,
 * origin TEXT,
 * trust INTEGER
 */
var filterRules = {
    id: function(i){
        return /^[0-9a-f]{0,64}$/i.test(i);
    },

    origin: function(i){
        return /^(quantum|rng|pki|seed)$/.test(i);
    },

    credential: function(i){
        return /^[0-9a-f]+$/i.test(i);
    },
};

function filter(what){
    return (function(){
        return function(i){
            try{
                return filterRules[what](i);
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
    config.create.unique = function(doc){
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
    config.create.gen = function(doc){
        if(!(
            filter('id')(doc.id) &&
            filter('origin')(doc.origin) &&
            filter('credential')(doc.credential) &&
            filter('decrypt')(doc.decrypt)
        ))
            return false;

        return {
            id: doc.id,
            epoch: new Date().getTime() / 1000.0,
            trust: 0,
            origin: doc.origin,
            credential: doc.credential,
            decrypt: doc.decrypt,
        };
    };

    // to specify one or more records, use this to generate conditon.
    config.retrive.condition
    = config.delete.condition
    = config.update.condition = function(condition){
        var allow = ['id', 'epoch', 'origin'];
        var result = {};
        for(var item in condition){
            if(allow.indexOf(item) >= 0){
                if(undefined != filterRules[item])
                    if(!filter(item)(condition[item])) return false;
                result[item] = condition[item];
            };
        };
        return condition;
    };

    config.update.gen = function(sets){
        return false;
    };

    return new CRUD($, _, sqldb, config);
};
