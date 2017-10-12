define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone');
    var Todo = Backbone.Model.extend({
        defaults: function() {
            return {
                text: '',
                complete: false
            }
        },
        toggle: function() {
            return this.save('complete', !this.get('complete'));
        }
    })
    module.exports = Todo;
})