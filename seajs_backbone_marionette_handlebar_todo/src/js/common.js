seajs.config({
    base: '/@@CONTEXT_PATHdist/js/', //base的配置是seajs的基础路径
    alias: {
        'jquery': 'lib/jquery.js?v=20160518',
        'backbone': 'lib/backbone.js?v=20160518',
        'backbone.localStorage': 'lib/backbone.localStorage.js?v=20160518',
        'backbone.marionette': 'lib/backbone.marionette.js?v=20160518',
        'backbone.radio': 'lib/backbone.radio.js?v=20160518',
        'mustache': 'lib/mustache.js?v=20160518',
        'underscore': 'lib/underscore.js?v=20160518',
        'jquery.tooltipster': 'lib/jquery.tooltipster.js?v=20160518',
        'handlebars': 'lib/handlebars-v4.0.10.js?v=20160518'
    }
});



// 此配置使用的是相对路径  等到正式上线以后可以切换成这种模式    可以有效的防止攻击
// seajs.config({
//     base: '../js/', //base的配置是seajs的基础路径
//     alias: {
//         'jquery': 'lib/jquery.js?v=20160518',
//         'backbone': 'lib/backbone.js?v=20160518',
//         'backbone.localStorage': 'lib/backbone.localStorage.js?v=20160518',
//         'mustache': 'lib/mustache.js?v=20160518',
//         'underscore': 'lib/underscore.js?v=20160518'
//     }
// });