define(function(require, exports, module) {
    require('backbone.marionette');
    require('backbone.localStorage');
    var Mn = Marionette,
        _ = require('underscore'),
        Backbone = require('backbone');
    var Handlebars = require('handlebars'),
        headerTpl = require('templates/header'),
        Layout = require('templates/layout'),
        MainHbs = require('templates/main_content'),
        ItemHbs = require('templates/item');

    var Todo = Backbone.Model.extend({
        defaults: function() {
            return {
                text: '',
                complete: false
            }
        }
    })

    var MyCollection = Backbone.Collection.extend({
        model: Todo,
        localStorage: new Backbone.LocalStorage('todo'),
    })


    var layoutView = Mn.View.extend({
        template: Layout
    })

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


    var todoView = Mn.View.extend({
        tagName: 'li',
        template: ItemHbs,
        initialize: function() {
            this.model.on('change', null, this);
        }
    })

    var UL = Mn.CollectionView.extend({
        tagName: 'ul',
        id: 'todos_list',
        childView: todoView
    })

    var MainView = Mn.View.extend({
        template: MainHbs,
        ui: {
            complete_all: '#complete_all'
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
                all = this.collection.length;
            $complete_all.toggleClass('hidden', !all);
        }
    })

    var AppControllerView = Mn.View.extend({
        el: '#content',
        template: false,
        regions: {
            header: '#header',
            main: '#main'
        },
        initialize: function() {
            var collection = new MyCollection();
            this.showChildView('header', new HeaderView({ collection: collection }));
            this.showChildView('main', new MainView({ collection: collection }));
        }
    })

    var Controller = {
        index: function() {
            new AppControllerView();
        }
    }
    var AppRouter = Mn.AppRouter.extend({
        controller: Controller,
        appRoutes: {
            '': 'index'
        }
    })
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