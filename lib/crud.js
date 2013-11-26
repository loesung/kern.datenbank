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
 *          gen: [FUNCTION], // given input, generate SQL
 *      },
 *      retrive: {
 *      },
 *      update: {
 *      },
 *      delete: {
 *      },
 *  }
 */

function CRUD(config){
};

module.exports = function($, _, sqldb){
    return new function(){
        var self = this;

        this.codebook = function(){
            return new CRUD(
            );
        };
    };
};
