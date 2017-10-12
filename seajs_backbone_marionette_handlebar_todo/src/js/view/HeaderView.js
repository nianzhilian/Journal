define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        headerTpl = require('templates/header');
    var HeaderView = Mn.View.extend({
        template: headerTpl,
        ui: {
            input: '#new_input'
        },
        events: {
            'keypress @ui.input': 'createTodo'
        },
        createTodo: function(e) {
            var value = e.target.value;
            var $input = this.getUI('input');
            if (value && e.which == 13) {
                this.collection.create({
                    text: value
                }, { sort: false })
                $input.focus().val('');
            }
        }
    })
    module.exports = HeaderView;
})