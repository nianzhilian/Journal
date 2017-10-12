define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        layoutView = require('view/layoutView'),
        AppRouter = require('route/routes');
    var App = Mn.Application.extend({
        region: '#app',
        initialize: function() {
            this.showView(new layoutView());
        }
    })
    var app = new App();
    app.AppRouter = new AppRouter();
    app.on('start', function() {
        Backbone.history.start({ pushState: false });
    })
    app.start();
})