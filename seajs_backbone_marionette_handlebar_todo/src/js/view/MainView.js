define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        MainHbs = require('templates/main_content'),
        UL = require('view/CollectionView');
    var MainView = Mn.View.extend({
        template: MainHbs,
        ui: {
            complete_all: '#complete_all'
        },
        events: {
            'change @ui.complete_all': 'toggleAll'
        },
        regions: {
            conWrap: '#main_content'
        },
        initialize: function() {
            this.listenTo(this.collection, 'all', this.render);
            this.collection.fetch({ reset: true })
        },
        onRender: function() {
            this.showChildView('conWrap', new UL({ collection: this.collection }));
            var $complete_all = this.getUI('complete_all'),
                all = this.collection.length,
                complete = this.collection.gethComplete().length;
            console.log(all);
            $complete_all.toggleClass('hidden', !all);
            $complete_all.find('input')[0].checked = all === complete;
        },
        toggleAll: function(e) {
            var isChecked = e.target.checked;
            this.collection.each(function(todo) {
                todo.save({ complete: isChecked });
                todo.collection.localStorage.update(todo);
            })
        }
    })
    module.exports = MainView;
})