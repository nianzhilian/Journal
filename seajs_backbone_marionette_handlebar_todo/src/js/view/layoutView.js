define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        Layout = require('templates/layout');
    var layoutView = Mn.View.extend({
        template: Layout
    })
    module.exports = layoutView;
})