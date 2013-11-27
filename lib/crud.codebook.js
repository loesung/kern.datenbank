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

    create.unique = function(doc){
        return {
            id: '',
        };
    };

    return new CRUD($, _, sqldb, config);
};
