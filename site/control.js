module.exports = function(packet, matchResult, post, rueckruf){
    var landmark = {
        process: $.process.report(),
        now: new Date().getTime() / 1000.0,
    };

    rueckruf(null, JSON.stringify(landmark));
};
