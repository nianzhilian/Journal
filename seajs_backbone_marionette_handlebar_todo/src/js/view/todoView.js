define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone'),
        ItemHbs = require('templates/item');
    var todoView = Mn.View.extend({
        tagName: 'li',
        template: ItemHbs,
        ui: {
            remove: '.remove',
            chk_complete: '.chk_complete',
            edit_input: '.edit_input'
        },
        events: {
            'click @ui.remove': 'clear',
            'change @ui.chk_complete': 'toggle',
            'dblclick': 'edit',
            'keypress @ui.edit_input': 'endEdit',
            'blur @ui.edit_input': 'endEdit'
        },
        initialize: function() {
            this.model.on('change', null, this);
        },
        clear: function() {
            var _sync = this.model.destroy({ wait: true })
            _sync && _sync.done(function() {
                console.log("删除成功!");
            })
        },
        toggle: function() {
            this.model.toggle();
        },
        edit: function(e) {
            var li = e.currentTarget;
            this.$el.addClass('edit');
            $(li).find('.edit_input').focus()
        },
        endEdit: function(e) {
            console.log($(e.currentTarget))
            if (e.type == 'keypress' && e.which != 13) return;
            var value = $.trim($(e.currentTarget).val())
            if (value) {
                var _sync = this.model.save({ text: value }),
                    that = this;
                _sync && _sync.done(function() {
                    console.log('修改成功！');
                    that.$el.removeClass('edit');
                })
            } else {
                this.destroy();
            }
        }
    })
    module.exports = todoView;
})