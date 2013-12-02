//    'CREATE TABLE queue(id TEXT, name TEXT)',
var filterRules = {
    id: function(i){
        return /^[0-9a-f]{1,64}$/i.test(i);
    },

    name: function(i){
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
        retrive: {
            columns: ['id', 'name'],
        },
        retriveOne: {},
        update: {},
        delete: {},

        db: {
            table: 'identity',
        },
    };

    // unique
    config.create.unique = function(doc){
        if(!(
            filter('id')(doc.id)
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
            filter('name')(doc.name)
        ))
            return false;

        return {
            id: doc.id,
            name: doc.name,
        };
    };

    // to specify one or more records, use this to generate conditon.
    config.retrive.condition
    = config.retriveOne.condition
    = config.delete.condition
    = config.update.condition = function(condition){
        var allow = ['id', 'name'];
        return filtrieren(condition, allow);
    };

    config.update.gen = function(sets){
        return false;   // close this function
    };

    function filtrieren(input, allow){
        var result = {};
        for(var item in input){
            if(allow.indexOf(item) >= 0){
                if(undefined != filterRules[item])
                    if(!filter(item)(input[item])) return false;
                result[item] = input[item];
            };
        };
        return result;
    };

    return new CRUD($, _, sqldb, config);
};


