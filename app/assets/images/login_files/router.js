(function(){//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Config ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//

var preloadSubscriptions = [];

Router.configure({
    layoutTemplate: 'layout',
    /*loadingTemplate: 'loading',
    notFoundTemplate: 'not_found',
    waitOn: function() {
        return _.map(preloadSubscriptions, function(sub) {
            Meteor.subscribe(sub);
        });
    }*/
});


//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Routes ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//

Router.map(function() {

    this.route('login', {
        path: '/login',
    });

    this.route('member', {
        path: '/member'
    });


});

})();
