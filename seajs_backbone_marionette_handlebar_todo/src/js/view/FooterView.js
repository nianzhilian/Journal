define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        HeaderView = require('view/HeaderView'),
        MyCollection = require('collection/collection'),
        FooterHbs = require('templates/footer');
    var FooterView = Mn.View.extend({
        className: 'clearfix',
        template: FooterHbs,
        ui: {
            uncomplete_count: '.uncomplete_count',
            btn_clear_all: '.btn-clear-all'
        },
        events: {
            'click @ui.btn_clear_all': 'clearAllComplete'
        },
        initialize: function() {
            this.listenTo(this.collection, 'all', this.render)
        },
        onRender: function() {
            var all = this.collection.length,
                complete = this.collection.gethComplete().length,
                unComplete = all - complete;
            this.$el.toggleClass('hidden', !all);
            this.$el.html(this.template({
                complete: complete,
                unComplete: unComplete
            })).find('.btn-clear-all').toggleClass('hidden', !complete);
        },
        clearAllComplete: function() {
            var complete = this.collection.gethComplete();
            complete.forEach(function(todo) {
                todo.collection.localStorage.destroy(todo);
                //清除属性
                todo.clear({ silent: true });
                todo.destroy()
            }, this);
        }
    })
    module.exports = FooterView
})