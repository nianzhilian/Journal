define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        HeaderView = require('view/HeaderView'),
        MyCollection = require('collection/collection'),
        MainView = require('view/MainView'),
        FooterView = require('view/FooterView');
    var AppControllerView = Mn.View.extend({
        el: '#content',
        template: false,
        regions: {
            header: '#header',
            main: '#main',
            footer: '#footer'
        },
        initialize: function() {
            var collection = new MyCollection();
            this.showChildView('header', new HeaderView({ collection: collection }));
            this.showChildView('main', new MainView({ collection: collection }));
            this.showChildView('footer', new FooterView({ collection: collection }));
            console.log(this.getRegion('footer'));
        }
    })
    module.exports = AppControllerView;
})