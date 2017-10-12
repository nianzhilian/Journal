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

    var loadInitData = function() {
            return Promise.resolve();
        }
        //创建全局application
    var App = Mn.Application.extend({
        region: '#app',
        initialize: function() {
            this.showView(Layout());
        }
    })

    //头
    var HeaderView = Mn.View.extend({
            initialize: function() {
                this.render();
            },
            template: false,
            ui: {
                input: '#new_input'
            },
            events: {
                'keypress @ui.input': 'createTodo'
            },
            createTodo: function(e) {
                // this.trigger('create:todo', e);
                // this.triggerMethod('did:something', e)
                var value = e.target.value;
                if (value && e.which == 13) {
                    // this.collection.create({
                    //     text: value
                    // })
                    var todo = new MyModel({ text: value }, {
                        collection: this.collection
                    })
                    var _sync = todo.save({}, { wait: true }),
                        that = this;
                    _sync && _sync.done(function() {
                        that.collection.add(todo, { sort: false });
                        that.ui.input.focus().val('');
                    })
                }
            },
            onRender: function() {
                this.$el.html(headerTpl());
            }
        })
        //itemView
    var ItemView = Mn.View.extend({
            tagName: 'li',
            template: ItemHbs,
            initialize: function() {
                this.listenTo(this.model, 'change', this.render)
            },
            onRender: function() {
                this.$el.html(this.template(this.model.toJSON()));
            }
        })
        //main
        // var MainView = Mn.CompositeView.extend({
        //         childView: ItemView,
        //         // childViewContainer: '#todos_list',
        //         template: MainHbs,
        //         initialize: function() {
        //             console.log(this.template);
        //             this.listenTo(this.collection, 'reset', this.handleToggleAllState);
        //             this.collection.fetch({ reset: true });
        //         },
        //         onRender: function() {
        //             $('#complete_all').addClass('abc');
        //             this.handleToggleAllState();
        //         },
        //         handleToggleAllState: function(method) {

    //         }
    //     })
    var MainCollectionView = Mn.CollectionView.extend({
        tagName: 'ul',
        id: 'todos_list',
        childView: ItemView
    })
    var showMainView = Mn.View.extend({
            tagName: 'table',
            className: 'table table-hover',
            template: MainHbs,
            regions: {
                ul: '#main_content'
            },
            initialize: function() {
                this.collection.fetch({ reset: true });

            },
            onRender: function() {
                this.showChildView('ul', new MainCollectionView({ collection: this.collection }));
                $('#complete_all').addClass('abc');
            }
        })
        //创建控制器
    var AppController = Mn.View.extend({
        el: '#content',
        template: false,
        regions: {
            header: '#header',
            main: '#main'
        },
        // childViewTriggers: {
        //     'create:todo': 'child:create:todo',
        // },
        // onChildCreateTodo: function(e) {
        //     console.log(e);
        // },
        // onChildviewDidSomething: function(e) {
        //     console.log(this.getChildView('header'))
        //     console.log(e);
        // },
        initialize: function(options) {
            var Collection = new MyCollection();
            console.log(Collection);
            this.showChildView('header', new HeaderView({ collection: Collection }));
            this.showChildView('main', new showMainView({ collection: Collection }));
        },
        index: function() {
            console.log(456);
        },
        filterItems: function() {
            console.log(789)
        },

    })



    var Controller = {
        index: function() {
            new AppController();
        },
        filterItems: function() {
            console.log(789)
        },
    }


    //创建路由
    var AppRouter = Mn.AppRouter.extend({
        controller: Controller,
        appRoutes: {
            '': 'index',
            '*filter': 'filterItems'
        }
    })




    var MyModel = Backbone.Model.extend({
        defaults: function() {
            return {
                text: '',
                complete: false
            }
        }
    });
    var MyCollection = Backbone.Collection.extend({
        model: MyModel,
        //保存数据
        localStorage: new Backbone.LocalStorage('todo'),
        //按照指定的算法进行排序
        // comparator: 'id',
    });

    var app = new App();
    app.AppRouter = new AppRouter();
    app.on('start', function() {
        Backbone.history.start({
            pushState: false
        });
    })
    app.start();
    // loadInitData().then(() => {
    //     app.start()
    // })
})