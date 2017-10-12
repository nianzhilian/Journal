define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        AppControllerView = require('view/AppControllerView');
    var Controller = {
        index: function() {
            new AppControllerView();
        }
    }
    var AppRouter = Mn.AppRouter.extend({
        controller: Controller,
        appRoutes: {
            '': 'index'
        }
    })

    module.exports = AppRouter;
})