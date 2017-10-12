define(function(require,exports,module){ var Handlebars = require('handlebars'); return Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "checked=\"checked\" ";
},"3":function(container,depth0,helpers,partials,data) {
    return "hidden";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, alias5=container.escapeExpression, buffer = 
  "<div id=\"content\"><h1>Todos</h1>\r\n        <hr>\r\n        <div class=\"pl20 pr20\">\r\n            <header id=\"header\">\r\n               \r\n            </header>\r\n            <section id=\"main\"></section>\r\n        </div>\r\n        <footer id=\"footer\">\r\n        </footer>\r\n        <!-- <script id=\"todo_view_tpl\" type=\"text/html\">\r\n            <label>\r\n            <input type=\"checkbox\" class=\"chk_complete\" ";
  stack1 = ((helper = (helper = helpers.complete || (depth0 != null ? depth0.complete : depth0)) != null ? helper : alias2),(options={"name":"complete","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.complete) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ">\r\n        </label>\r\n            <span class=\"todo_text\">"
    + alias5(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</span>\r\n            <a href=\"javascript:;\" class=\"remove pull-right\"><span class=\"\">X</span></a>\r\n            <input class=\"form-control edit_input\" type=\"text\" value=\""
    + alias5(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\">\r\n        </script> -->\r\n        <!-- <script id=\"footer_tpl\" type=\"text/html\">\r\n            <span class=\"pull-left\">还有<span class=\"uncomplete_count\">"
    + alias5(((helper = (helper = helpers.unComplete || (depth0 != null ? depth0.unComplete : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"unComplete","hash":{},"data":data}) : helper)))
    + "</span>个待办项未完成</span>\r\n            <a class=\"pull-right btn btn-default btn-clear-all ";
  stack1 = ((helper = (helper = helpers.complete || (depth0 != null ? depth0.complete : depth0)) != null ? helper : alias2),(options={"name":"complete","hash":{},"fn":container.noop,"inverse":container.program(3, data, 0),"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.complete) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\" href=\"javascript:;\">清除已经完成的<span\r\n                    class=\"complete_count\">"
    + alias5(((helper = (helper = helpers.complete || (depth0 != null ? depth0.complete : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"complete","hash":{},"data":data}) : helper)))
    + "</span>项</a>\r\n        </script> -->\r\n        </div>";
},"useData":true})})