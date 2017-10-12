define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        todoView = require('view/todoView');
    var UL = Mn.CollectionView.extend({
        tagName: 'ul',
        id: 'todos_list',
        childView: todoView
    })
    module.exports = UL;
})