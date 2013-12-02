//    'CREATE TABLE queue(id TEXT, tag TEXT, data TEXT, timestamp INTEGER)',
var filterRules = {
    id: function(i){
        return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(i);
    },

    tag: function(i){
        return /^[0-9a-f]{1,64}$/i.test(i);
    },

    data: function(i){
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
            columns: ['id', 'tag', 'timestamp'],
        },
        retriveOne: {},
        update: {},
        delete: {},

        db: {
            table: 'queue',
        },
    };

    // to insert a new record, firstly use following function to derive
    // the needed format.
    config.create.gen = function(doc){
        if(!(
            filter('tag')(doc.tag) &&
            filter('data')(doc.data)
        ))
            return false;

        return {
            id: $.security.uuid(),
            tag: doc.tag,
            timestamp: new Date().getTime() / 1000.0,
            data: doc.data,
        };
    };

    // to specify one or more records, use this to generate conditon.
    config.retrive.condition
    = config.retriveOne.condition
    = config.delete.condition
    = config.update.condition = function(condition){
        var allow = ['id', 'tag', 'timestamp'];
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

