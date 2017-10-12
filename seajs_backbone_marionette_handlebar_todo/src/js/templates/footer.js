define(function(require,exports,module){ var Handlebars = require('handlebars'); return Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<span class=\"pull-left\">还有<span class=\"uncomplete_count\">"
    + alias4(((helper = (helper = helpers.unComplete || (depth0 != null ? depth0.unComplete : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"unComplete","hash":{},"data":data}) : helper)))
    + "</span>个待办项未完成</span>\r\n            <a class=\"pull-right btn btn-default btn-clear-all\" href=\"javascript:;\">清除已经完成的<span\r\n                    class=\"complete_count\">"
    + alias4(((helper = (helper = helpers.complete || (depth0 != null ? depth0.complete : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"complete","hash":{},"data":data}) : helper)))
    + "</span>项</a>";
},"useData":true})})