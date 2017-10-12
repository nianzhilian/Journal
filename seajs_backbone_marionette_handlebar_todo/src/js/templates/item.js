define(function(require,exports,module){ var Handlebars = require('handlebars'); return Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "            <input type=\"checkbox\" class=\"chk_complete\" checked>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "            <input type=\"checkbox\" class=\"chk_complete\">\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<label>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.complete : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "        </label>\r\n            <span class=\"todo_text\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</span>\r\n            <a href=\"javascript:;\" class=\"remove pull-right\"><span class=\"\">X</span></a>\r\n            <input class=\"form-control edit_input\" type=\"text\" value=\""
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\">";
},"useData":true})})