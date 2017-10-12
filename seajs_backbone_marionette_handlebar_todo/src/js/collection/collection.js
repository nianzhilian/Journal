define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        Todo = require('model/model');
    var MyCollection = Backbone.Collection.extend({
        model: Todo,
        localStorage: new Backbone.LocalStorage('todo'),
        gethComplete: function() {
            return this.where({ complete: true })
        }
    })
    module.exports = MyCollection;
})