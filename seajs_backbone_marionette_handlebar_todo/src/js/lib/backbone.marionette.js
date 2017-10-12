define(function(require, exports) {
    var previousUnderscore = this._;
    var previousBackbone = this.Backbone;
    var previousRadio = this.Radio;
    this._ = require('underscore');
    this.Backbone = require('backbone');
    this.Radio = require('backbone.radio');
    (function(global, factory) { typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone'), require('underscore'), require('backbone.radio')) : typeof define === 'function' && define.amd ? define(['backbone', 'underscore', 'backbone.radio'], factory) : (global.Marionette = factory(global.Backbone, global._, global.Backbone.Radio)); }(this, (function(Backbone, _, Radio) {
        'use strict';
        Backbone = Backbone && Backbone.hasOwnProperty('default') ? Backbone['default'] : Backbone;
        _ = _ && _.hasOwnProperty('default') ? _['default'] : _;
        Radio = Radio && Radio.hasOwnProperty('default') ? Radio['default'] : Radio;
        var version = "3.4.3";
        var proxy = function proxy(method) {
            return function(context) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
                return method.apply(context, args);
            };
        };
        var extend = Backbone.Model.extend;
        var deprecate = function deprecate(message, test) {
            if (_.isObject(message)) { message = message.prev + ' is going to be removed in the future. ' + 'Please use ' + message.next + ' instead.' + (message.url ? ' See: ' + message.url : ''); }
            if (!Marionette.DEV_MODE) { return; }
            if ((test === undefined || !test) && !deprecate._cache[message]) {
                deprecate._warn('Deprecation warning: ' + message);
                deprecate._cache[message] = true;
            }
        };
        deprecate._console = typeof console !== 'undefined' ? console : {};
        deprecate._warn = function() { var warn = deprecate._console.warn || deprecate._console.log || _.noop; return warn.apply(deprecate._console, arguments); };
        deprecate._cache = {};
        var isNodeAttached = function isNodeAttached(el) { return document.documentElement.contains(el && el.parentNode); };
        var mergeOptions = function mergeOptions(options, keys) {
            var _this = this;
            if (!options) { return; }
            _.each(keys, function(key) { var option = options[key]; if (option !== undefined) { _this[key] = option; } });
        };
        var getOption = function getOption(optionName) {
            if (!optionName) { return; }
            if (this.options && this.options[optionName] !== undefined) { return this.options[optionName]; } else { return this[optionName]; }
        };
        var normalizeMethods = function normalizeMethods(hash) {
            var _this = this;
            return _.reduce(hash, function(normalizedHash, method, name) {
                if (!_.isFunction(method)) { method = _this[method]; }
                if (method) { normalizedHash[name] = method; }
                return normalizedHash;
            }, {});
        };
        var splitter = /(^|:)(\w)/gi;

        function getEventName(match, prefix, eventName) { return eventName.toUpperCase(); }
        var getOnMethodName = _.memoize(function(event) { return 'on' + event.replace(splitter, getEventName); });

        function triggerMethod(event) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
            var methodName = getOnMethodName(event);
            var method = getOption.call(this, methodName);
            var result = void 0;
            if (_.isFunction(method)) { result = method.apply(this, args); }
            this.trigger.apply(this, arguments);
            return result;
        }

        function triggerMethodOn(context) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) { args[_key2 - 1] = arguments[_key2]; }
            if (_.isFunction(context.triggerMethod)) { return context.triggerMethod.apply(context, args); }
            return triggerMethod.apply(context, args);
        }

        function triggerMethodChildren(view, event, shouldTrigger) {
            if (!view._getImmediateChildren) { return; }
            _.each(view._getImmediateChildren(), function(child) {
                if (!shouldTrigger(child)) { return; }
                triggerMethodOn(child, event, child);
            });
        }

        function shouldTriggerAttach(view) { return !view._isAttached; }

        function shouldAttach(view) {
            if (!shouldTriggerAttach(view)) { return false; }
            view._isAttached = true;
            return true;
        }

        function shouldTriggerDetach(view) { return view._isAttached; }

        function shouldDetach(view) {
            if (!shouldTriggerDetach(view)) { return false; }
            view._isAttached = false;
            return true;
        }

        function triggerDOMRefresh(view) { if (view._isAttached && view._isRendered) { triggerMethodOn(view, 'dom:refresh', view); } }

        function triggerDOMRemove(view) { if (view._isAttached && view._isRendered) { triggerMethodOn(view, 'dom:remove', view); } }

        function handleBeforeAttach() { triggerMethodChildren(this, 'before:attach', shouldTriggerAttach); }

        function handleAttach() {
            triggerMethodChildren(this, 'attach', shouldAttach);
            triggerDOMRefresh(this);
        }

        function handleBeforeDetach() {
            triggerMethodChildren(this, 'before:detach', shouldTriggerDetach);
            triggerDOMRemove(this);
        }

        function handleDetach() { triggerMethodChildren(this, 'detach', shouldDetach); }

        function handleBeforeRender() { triggerDOMRemove(this); }

        function handleRender() { triggerDOMRefresh(this); }

        function monitorViewEvents(view) {
            if (view._areViewEventsMonitored || view.monitorViewEvents === false) { return; }
            view._areViewEventsMonitored = true;
            view.on({ 'before:attach': handleBeforeAttach, 'attach': handleAttach, 'before:detach': handleBeforeDetach, 'detach': handleDetach, 'before:render': handleBeforeRender, 'render': handleRender });
        }
        var errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number'];
        var MarionetteError = extend.call(Error, {
            urlRoot: 'http://marionettejs.com/docs/v' + version + '/',
            constructor: function constructor(message, options) {
                if (_.isObject(message)) {
                    options = message;
                    message = options.message;
                } else if (!options) { options = {}; }
                var error = Error.call(this, message);
                _.extend(this, _.pick(error, errorProps), _.pick(options, errorProps));
                this.captureStackTrace();
                if (options.url) { this.url = this.urlRoot + options.url; }
            },
            captureStackTrace: function captureStackTrace() { if (Error.captureStackTrace) { Error.captureStackTrace(this, MarionetteError); } },
            toString: function toString() { return this.name + ': ' + this.message + (this.url ? ' See: ' + this.url : ''); }
        });
        MarionetteError.extend = extend;

        function bindFromStrings(target, entity, evt, methods, actionName) {
            var methodNames = methods.split(/\s+/);
            _.each(methodNames, function(methodName) {
                var method = target[methodName];
                if (!method) { throw new MarionetteError('Method "' + methodName + '" was configured as an event handler, but does not exist.'); }
                target[actionName](entity, evt, method);
            });
        }

        function iterateEvents(target, entity, bindings, actionName) {
            if (!entity || !bindings) { return; }
            if (!_.isObject(bindings)) { throw new MarionetteError({ message: 'Bindings must be an object.', url: 'marionette.functions.html#marionettebindevents' }); }
            _.each(bindings, function(method, evt) {
                if (_.isString(method)) { bindFromStrings(target, entity, evt, method, actionName); return; }
                target[actionName](entity, evt, method);
            });
        }

        function bindEvents(entity, bindings) { iterateEvents(this, entity, bindings, 'listenTo'); return this; }

        function unbindEvents(entity, bindings) { iterateEvents(this, entity, bindings, 'stopListening'); return this; }

        function iterateReplies(target, channel, bindings, actionName) {
            if (!channel || !bindings) { return; }
            if (!_.isObject(bindings)) { throw new MarionetteError({ message: 'Bindings must be an object.', url: 'marionette.functions.html#marionettebindrequests' }); }
            var normalizedRadioRequests = normalizeMethods.call(target, bindings);
            channel[actionName](normalizedRadioRequests, target);
        }

        function bindRequests(channel, bindings) { iterateReplies(this, channel, bindings, 'reply'); return this; }

        function unbindRequests(channel, bindings) { iterateReplies(this, channel, bindings, 'stopReplying'); return this; }
        var setOptions = function setOptions(options) { this.options = _.extend({}, _.result(this, 'options'), options); };
        var CommonMixin = { normalizeMethods: normalizeMethods, _setOptions: setOptions, mergeOptions: mergeOptions, getOption: getOption, bindEvents: bindEvents, unbindEvents: unbindEvents };
        var RadioMixin = {
            _initRadio: function _initRadio() {
                var channelName = _.result(this, 'channelName');
                if (!channelName) { return; }
                if (!Radio) { throw new MarionetteError({ name: 'BackboneRadioMissing', message: 'The dependency "backbone.radio" is missing.' }); }
                var channel = this._channel = Radio.channel(channelName);
                var radioEvents = _.result(this, 'radioEvents');
                this.bindEvents(channel, radioEvents);
                var radioRequests = _.result(this, 'radioRequests');
                this.bindRequests(channel, radioRequests);
                this.on('destroy', this._destroyRadio);
            },
            _destroyRadio: function _destroyRadio() { this._channel.stopReplying(null, null, this); },
            getChannel: function getChannel() { return this._channel; },
            bindEvents: bindEvents,
            unbindEvents: unbindEvents,
            bindRequests: bindRequests,
            unbindRequests: unbindRequests
        };
        var ClassOptions = ['channelName', 'radioEvents', 'radioRequests'];
        var MarionetteObject = function MarionetteObject(options) {
            if (!this.hasOwnProperty('options')) { this._setOptions(options); }
            this.mergeOptions(options, ClassOptions);
            this._setCid();
            this._initRadio();
            this.initialize.apply(this, arguments);
        };
        MarionetteObject.extend = extend;
        _.extend(MarionetteObject.prototype, Backbone.Events, CommonMixin, RadioMixin, {
            cidPrefix: 'mno',
            _isDestroyed: false,
            isDestroyed: function isDestroyed() { return this._isDestroyed; },
            initialize: function initialize() {},
            _setCid: function _setCid() {
                if (this.cid) { return; }
                this.cid = _.uniqueId(this.cidPrefix);
            },
            destroy: function destroy() {
                if (this._isDestroyed) { return this; }
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
                this.triggerMethod.apply(this, ['before:destroy', this].concat(args));
                this._isDestroyed = true;
                this.triggerMethod.apply(this, ['destroy', this].concat(args));
                this.stopListening();
                return this;
            },
            triggerMethod: triggerMethod
        });
        var TemplateCache = function TemplateCache(templateId) { this.templateId = templateId; };
        _.extend(TemplateCache, {
            templateCaches: {},
            get: function get(templateId, options) {
                var cachedTemplate = this.templateCaches[templateId];
                if (!cachedTemplate) {
                    cachedTemplate = new TemplateCache(templateId);
                    this.templateCaches[templateId] = cachedTemplate;
                }
                return cachedTemplate.load(options);
            },
            clear: function clear() {
                var i = void 0;
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
                var length = args.length;
                if (length > 0) { for (i = 0; i < length; i++) { delete this.templateCaches[args[i]]; } } else { this.templateCaches = {}; }
            }
        });
        _.extend(TemplateCache.prototype, {
            load: function load(options) {
                if (this.compiledTemplate) { return this.compiledTemplate; }
                var template = this.loadTemplate(this.templateId, options);
                this.compiledTemplate = this.compileTemplate(template, options);
                return this.compiledTemplate;
            },
            loadTemplate: function loadTemplate(templateId, options) {
                var $template = Backbone.$(templateId);
                if (!$template.length) { throw new MarionetteError({ name: 'NoTemplateError', message: 'Could not find template: "' + templateId + '"' }); }
                return $template.html();
            },
            compileTemplate: function compileTemplate(rawTemplate, options) { return _.template(rawTemplate, options); }
        });
        var _invoke = _.invokeMap || _.invoke;

        function getBehaviorClass(options, key) {
            if (options.behaviorClass) { return options.behaviorClass; } else if (_.isFunction(options)) { return options; }
            if (_.isFunction(Marionette.Behaviors.behaviorsLookup)) { return Marionette.Behaviors.behaviorsLookup(options, key)[key]; }
            return Marionette.Behaviors.behaviorsLookup[key];
        }

        function parseBehaviors(view, behaviors) { return _.chain(behaviors).map(function(options, key) { var BehaviorClass = getBehaviorClass(options, key); var _options = options === BehaviorClass ? {} : options; var behavior = new BehaviorClass(_options, view); var nestedBehaviors = parseBehaviors(view, _.result(behavior, 'behaviors')); return [behavior].concat(nestedBehaviors); }).flatten().value(); }
        var BehaviorsMixin = {
            _initBehaviors: function _initBehaviors() { this._behaviors = this._getBehaviors(); },
            _getBehaviors: function _getBehaviors() { var behaviors = _.result(this, 'behaviors'); return _.isObject(behaviors) ? parseBehaviors(this, behaviors) : {}; },
            _getBehaviorTriggers: function _getBehaviorTriggers() { var triggers = _invoke(this._behaviors, 'getTriggers'); return _.reduce(triggers, function(memo, _triggers) { return _.extend(memo, _triggers); }, {}); },
            _getBehaviorEvents: function _getBehaviorEvents() { var events = _invoke(this._behaviors, 'getEvents'); return _.reduce(events, function(memo, _events) { return _.extend(memo, _events); }, {}); },
            _proxyBehaviorViewProperties: function _proxyBehaviorViewProperties() { _invoke(this._behaviors, 'proxyViewProperties'); },
            _delegateBehaviorEntityEvents: function _delegateBehaviorEntityEvents() { _invoke(this._behaviors, 'delegateEntityEvents'); },
            _undelegateBehaviorEntityEvents: function _undelegateBehaviorEntityEvents() { _invoke(this._behaviors, 'undelegateEntityEvents'); },
            _destroyBehaviors: function _destroyBehaviors() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
                _invoke.apply(undefined, [this._behaviors, 'destroy'].concat(args));
            },
            _removeBehavior: function _removeBehavior(behavior) {
                if (this._isDestroyed) { return; }
                this._behaviors = _.without(this._behaviors, behavior);
            },
            _bindBehaviorUIElements: function _bindBehaviorUIElements() { _invoke(this._behaviors, 'bindUIElements'); },
            _unbindBehaviorUIElements: function _unbindBehaviorUIElements() { _invoke(this._behaviors, 'unbindUIElements'); },
            _triggerEventOnBehaviors: function _triggerEventOnBehaviors() { var behaviors = this._behaviors; for (var i = 0, length = behaviors && behaviors.length; i < length; i++) { triggerMethod.apply(behaviors[i], arguments); } }
        };
        var DelegateEntityEventsMixin = {
            _delegateEntityEvents: function _delegateEntityEvents(model, collection) {
                this._undelegateEntityEvents(model, collection);
                var modelEvents = _.result(this, 'modelEvents');
                bindEvents.call(this, model, modelEvents);
                var collectionEvents = _.result(this, 'collectionEvents');
                bindEvents.call(this, collection, collectionEvents);
            },
            _undelegateEntityEvents: function _undelegateEntityEvents(model, collection) {
                var modelEvents = _.result(this, 'modelEvents');
                unbindEvents.call(this, model, modelEvents);
                var collectionEvents = _.result(this, 'collectionEvents');
                unbindEvents.call(this, collection, collectionEvents);
            }
        };
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;

        function uniqueName(eventName, selector) { return '' + eventName + _.uniqueId('.evt') + ' ' + selector; }
        var getUniqueEventName = function getUniqueEventName(eventName) { var match = eventName.match(delegateEventSplitter); return uniqueName(match[1], match[2]); };
        var FEATURES = { childViewEventPrefix: true, triggersStopPropagation: true, triggersPreventDefault: true };

        function isEnabled(name) { return !!FEATURES[name]; }

        function setEnabled(name, state) { return FEATURES[name] = state; }

        function buildViewTrigger(view, triggerDef) {
            if (_.isString(triggerDef)) { triggerDef = { event: triggerDef }; }
            var eventName = triggerDef.event;
            var shouldPreventDefault = !!triggerDef.preventDefault;
            if (isEnabled('triggersPreventDefault')) { shouldPreventDefault = triggerDef.preventDefault !== false; }
            var shouldStopPropagation = !!triggerDef.stopPropagation;
            if (isEnabled('triggersStopPropagation')) { shouldStopPropagation = triggerDef.stopPropagation !== false; }
            return function(event) {
                if (shouldPreventDefault) { event.preventDefault(); }
                if (shouldStopPropagation) { event.stopPropagation(); }
                view.triggerMethod(eventName, view, event);
            };
        }
        var TriggersMixin = {
            _getViewTriggers: function _getViewTriggers(view, triggers) {
                return _.reduce(triggers, function(events, value, key) {
                    key = getUniqueEventName(key);
                    events[key] = buildViewTrigger(view, value);
                    return events;
                }, {});
            }
        };
        var _normalizeUIKeys = function _normalizeUIKeys(hash, ui) {
            return _.reduce(hash, function(memo, val, key) {
                var normalizedKey = _normalizeUIString(key, ui);
                memo[normalizedKey] = val;
                return memo;
            }, {});
        };
        var _normalizeUIString = function _normalizeUIString(uiString, ui) { return uiString.replace(/@ui\.[a-zA-Z-_$0-9]*/g, function(r) { return ui[r.slice(4)]; }); };
        var _normalizeUIValues = function _normalizeUIValues(hash, ui, properties) {
            _.each(hash, function(val, key) {
                if (_.isString(val)) { hash[key] = _normalizeUIString(val, ui); } else if (_.isObject(val) && _.isArray(properties)) {
                    _.extend(val, _normalizeUIValues(_.pick(val, properties), ui));
                    _.each(properties, function(property) { var propertyVal = val[property]; if (_.isString(propertyVal)) { val[property] = _normalizeUIString(propertyVal, ui); } });
                }
            });
            return hash;
        };
        var UIMixin = {
            normalizeUIKeys: function normalizeUIKeys(hash) { var uiBindings = this._getUIBindings(); return _normalizeUIKeys(hash, uiBindings); },
            normalizeUIString: function normalizeUIString(uiString) { var uiBindings = this._getUIBindings(); return _normalizeUIString(uiString, uiBindings); },
            normalizeUIValues: function normalizeUIValues(hash, properties) { var uiBindings = this._getUIBindings(); return _normalizeUIValues(hash, uiBindings, properties); },
            _getUIBindings: function _getUIBindings() { var uiBindings = _.result(this, '_uiBindings'); var ui = _.result(this, 'ui'); return uiBindings || ui; },
            _bindUIElements: function _bindUIElements() {
                var _this = this;
                if (!this.ui) { return; }
                if (!this._uiBindings) { this._uiBindings = this.ui; }
                var bindings = _.result(this, '_uiBindings');
                this._ui = {};
                _.each(bindings, function(selector, key) { _this._ui[key] = _this.$(selector); });
                this.ui = this._ui;
            },
            _unbindUIElements: function _unbindUIElements() {
                var _this2 = this;
                if (!this.ui || !this._uiBindings) { return; }
                _.each(this.ui, function($el, name) { delete _this2.ui[name]; });
                this.ui = this._uiBindings;
                delete this._uiBindings;
                delete this._ui;
            },
            _getUI: function _getUI(name) { return this._ui[name]; }
        };

        function _getEl(el) { return el instanceof Backbone.$ ? el : Backbone.$(el); }

        function setDomApi(mixin) { this.prototype.Dom = _.extend({}, this.prototype.Dom, mixin); return this; }
        var DomApi = {
            createBuffer: function createBuffer() { return document.createDocumentFragment(); },
            getEl: function getEl(selector) { return _getEl(selector); },
            findEl: function findEl(el, selector) { var _$el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _getEl(el); return _$el.find(selector); },
            hasEl: function hasEl(el, childEl) { return el.contains(childEl && childEl.parentNode); },
            detachEl: function detachEl(el) {
                var _$el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _getEl(el);
                _$el.detach();
            },
            replaceEl: function replaceEl(newEl, oldEl) {
                if (newEl === oldEl) { return; }
                var parent = oldEl.parentNode;
                if (!parent) { return; }
                parent.replaceChild(newEl, oldEl);
            },
            swapEl: function swapEl(el1, el2) {
                if (el1 === el2) { return; }
                var parent1 = el1.parentNode;
                var parent2 = el2.parentNode;
                if (!parent1 || !parent2) { return; }
                var next1 = el1.nextSibling;
                var next2 = el2.nextSibling;
                parent1.insertBefore(el2, next1);
                parent2.insertBefore(el1, next2);
            },
            setContents: function setContents(el, html) {
                var _$el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _getEl(el);
                _$el.html(html);
            },
            appendContents: function appendContents(el, contents) {
                var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
                    _ref$_$el = _ref._$el,
                    _$el = _ref$_$el === undefined ? _getEl(el) : _ref$_$el,
                    _ref$_$contents = _ref._$contents,
                    _$contents = _ref$_$contents === undefined ? _getEl(contents) : _ref$_$contents;
                _$el.append(_$contents);
            },
            hasContents: function hasContents(el) { return el.hasChildNodes(); },
            detachContents: function detachContents(el) {
                var _$el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _getEl(el);
                _$el.contents().detach();
            }
        };
        var ViewMixin = {
            Dom: DomApi,
            supportsRenderLifecycle: true,
            supportsDestroyLifecycle: true,
            _isDestroyed: false,
            isDestroyed: function isDestroyed() { return !!this._isDestroyed; },
            _isRendered: false,
            isRendered: function isRendered() { return !!this._isRendered; },
            _isAttached: false,
            isAttached: function isAttached() { return !!this._isAttached; },
            delegateEvents: function delegateEvents(eventsArg) {
                this._proxyBehaviorViewProperties();
                this._buildEventProxies();
                var viewEvents = this._getEvents(eventsArg);
                if (typeof eventsArg === 'undefined') { this.events = viewEvents; }
                var combinedEvents = _.extend({}, this._getBehaviorEvents(), viewEvents, this._getBehaviorTriggers(), this.getTriggers());
                Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
                return this;
            },
            _getEvents: function _getEvents(eventsArg) {
                var events = eventsArg || this.events;
                if (_.isFunction(events)) { return this.normalizeUIKeys(events.call(this)); }
                return this.normalizeUIKeys(events);
            },
            getTriggers: function getTriggers() {
                if (!this.triggers) { return; }
                var triggers = this.normalizeUIKeys(_.result(this, 'triggers'));
                return this._getViewTriggers(this, triggers);
            },
            delegateEntityEvents: function delegateEntityEvents() {
                this._delegateEntityEvents(this.model, this.collection);
                this._delegateBehaviorEntityEvents();
                return this;
            },
            undelegateEntityEvents: function undelegateEntityEvents() {
                this._undelegateEntityEvents(this.model, this.collection);
                this._undelegateBehaviorEntityEvents();
                return this;
            },
            destroy: function destroy() {
                if (this._isDestroyed) { return this; }
                var shouldTriggerDetach = this._isAttached && !this._shouldDisableEvents;
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
                this.triggerMethod.apply(this, ['before:destroy', this].concat(args));
                if (shouldTriggerDetach) { this.triggerMethod('before:detach', this); }
                this.unbindUIElements();
                this._removeElement();
                if (shouldTriggerDetach) {
                    this._isAttached = false;
                    this.triggerMethod('detach', this);
                }
                this._removeChildren();
                this._isDestroyed = true;
                this._isRendered = false;
                this._destroyBehaviors.apply(this, args);
                this.triggerMethod.apply(this, ['destroy', this].concat(args));
                this.stopListening();
                return this;
            },
            _removeElement: function _removeElement() {
                this.$el.off().removeData();
                this.Dom.detachEl(this.el, this.$el);
            },
            bindUIElements: function bindUIElements() {
                this._bindUIElements();
                this._bindBehaviorUIElements();
                return this;
            },
            unbindUIElements: function unbindUIElements() {
                this._unbindUIElements();
                this._unbindBehaviorUIElements();
                return this;
            },
            getUI: function getUI(name) { return this._getUI(name); },
            childViewEventPrefix: function childViewEventPrefix() { return isEnabled('childViewEventPrefix') ? 'childview' : false; },
            triggerMethod: function triggerMethod$$1() {
                var ret = triggerMethod.apply(this, arguments);
                this._triggerEventOnBehaviors.apply(this, arguments);
                return ret;
            },
            _buildEventProxies: function _buildEventProxies() {
                this._childViewEvents = _.result(this, 'childViewEvents');
                this._childViewTriggers = _.result(this, 'childViewTriggers');
            },
            _proxyChildViewEvents: function _proxyChildViewEvents(view) { this.listenTo(view, 'all', this._childViewEventHandler); },
            _childViewEventHandler: function _childViewEventHandler(eventName) {
                var childViewEvents = this.normalizeMethods(this._childViewEvents);
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) { args[_key2 - 1] = arguments[_key2]; }
                if (typeof childViewEvents !== 'undefined' && _.isFunction(childViewEvents[eventName])) { childViewEvents[eventName].apply(this, args); }
                var childViewTriggers = this._childViewTriggers;
                if (childViewTriggers && _.isString(childViewTriggers[eventName])) { this.triggerMethod.apply(this, [childViewTriggers[eventName]].concat(args)); }
                var prefix = _.result(this, 'childViewEventPrefix');
                if (prefix !== false) {
                    var childEventName = prefix + ':' + eventName;
                    this.triggerMethod.apply(this, [childEventName].concat(args));
                }
            }
        };
        _.extend(ViewMixin, BehaviorsMixin, CommonMixin, DelegateEntityEventsMixin, TriggersMixin, UIMixin);

        function renderView(view) {
            if (view._isRendered) { return; }
            if (!view.supportsRenderLifecycle) { triggerMethodOn(view, 'before:render', view); }
            view.render();
            if (!view.supportsRenderLifecycle) {
                view._isRendered = true;
                triggerMethodOn(view, 'render', view);
            }
        }

        function destroyView(view) {
            if (view.destroy) { view.destroy(); return; }
            if (!view.supportsDestroyLifecycle) { triggerMethodOn(view, 'before:destroy', view); }
            var shouldTriggerDetach = view._isAttached && !view._shouldDisableEvents;
            if (shouldTriggerDetach) { triggerMethodOn(view, 'before:detach', view); }
            view.remove();
            if (shouldTriggerDetach) {
                view._isAttached = false;
                triggerMethodOn(view, 'detach', view);
            }
            view._isDestroyed = true;
            if (!view.supportsDestroyLifecycle) { triggerMethodOn(view, 'destroy', view); }
        }
        var ClassOptions$2 = ['allowMissingEl', 'parentEl', 'replaceElement'];
        var Region = MarionetteObject.extend({
            Dom: DomApi,
            cidPrefix: 'mnr',
            replaceElement: false,
            _isReplaced: false,
            _isSwappingView: false,
            constructor: function constructor(options) {
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$2);
                this._initEl = this.el = this.getOption('el');
                this.el = this.el instanceof Backbone.$ ? this.el[0] : this.el;
                if (!this.el) { throw new MarionetteError({ name: 'NoElError', message: 'An "el" must be specified for a region.' }); }
                this.$el = this.getEl(this.el);
                MarionetteObject.call(this, options);
            },
            show: function show(view, options) {
                if (!this._ensureElement(options)) { return; }
                view = this._getView(view, options);
                if (view === this.currentView) { return this; }
                this._isSwappingView = !!this.currentView;
                this.triggerMethod('before:show', this, view, options);
                if (!view._isAttached) { this.empty(options); }
                this._setupChildView(view);
                this.currentView = view;
                renderView(view);
                this._attachView(view, options);
                this.triggerMethod('show', this, view, options);
                this._isSwappingView = false;
                return this;
            },
            _setupChildView: function _setupChildView(view) {
                monitorViewEvents(view);
                this._proxyChildViewEvents(view);
                view.on('destroy', this._empty, this);
            },
            _proxyChildViewEvents: function _proxyChildViewEvents(view) {
                var parentView = this._parentView;
                if (!parentView) { return; }
                parentView._proxyChildViewEvents(view);
            },
            _shouldDisableMonitoring: function _shouldDisableMonitoring() { return this._parentView && this._parentView.monitorViewEvents === false; },
            _attachView: function _attachView(view) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var shouldTriggerAttach = !view._isAttached && isNodeAttached(this.el) && !this._shouldDisableMonitoring();
                var shouldReplaceEl = typeof options.replaceElement === 'undefined' ? !!_.result(this, 'replaceElement') : !!options.replaceElement;
                if (shouldTriggerAttach) { triggerMethodOn(view, 'before:attach', view); }
                if (shouldReplaceEl) { this._replaceEl(view); } else { this.attachHtml(view); }
                if (shouldTriggerAttach) {
                    view._isAttached = true;
                    triggerMethodOn(view, 'attach', view);
                }
            },
            _ensureElement: function _ensureElement() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                if (!_.isObject(this.el)) {
                    this.$el = this.getEl(this.el);
                    this.el = this.$el[0];
                    this.$el = this.Dom.getEl(this.el);
                }
                if (!this.$el || this.$el.length === 0) { var allowMissingEl = typeof options.allowMissingEl === 'undefined' ? !!_.result(this, 'allowMissingEl') : !!options.allowMissingEl; if (allowMissingEl) { return false; } else { throw new MarionetteError('An "el" must exist in DOM for this region ' + this.cid); } }
                return true;
            },
            _getView: function _getView(view) {
                if (!view) { throw new MarionetteError({ name: 'ViewNotValid', message: 'The view passed is undefined and therefore invalid. You must pass a view instance to show.' }); }
                if (view._isDestroyed) { throw new MarionetteError({ name: 'ViewDestroyedError', message: 'View (cid: "' + view.cid + '") has already been destroyed and cannot be used.' }); }
                if (view instanceof Backbone.View) { return view; }
                var viewOptions = this._getViewOptions(view);
                return new View(viewOptions);
            },
            _getViewOptions: function _getViewOptions(viewOptions) {
                if (_.isFunction(viewOptions)) { return { template: viewOptions }; }
                if (_.isObject(viewOptions)) { return viewOptions; }
                var template = function template() { return viewOptions; };
                return { template: template };
            },
            getEl: function getEl(el) {
                var context = _.result(this, 'parentEl');
                if (context && _.isString(el)) { return this.Dom.findEl(context, el); }
                return this.Dom.getEl(el);
            },
            _replaceEl: function _replaceEl(view) {
                this._restoreEl();
                view.on('before:destroy', this._restoreEl, this);
                this.Dom.replaceEl(view.el, this.el);
                this._isReplaced = true;
            },
            _restoreEl: function _restoreEl() {
                if (!this._isReplaced) { return; }
                var view = this.currentView;
                if (!view) { return; }
                this._detachView(view);
                this._isReplaced = false;
            },
            isReplaced: function isReplaced() { return !!this._isReplaced; },
            isSwappingView: function isSwappingView() { return !!this._isSwappingView; },
            attachHtml: function attachHtml(view) { this.Dom.appendContents(this.el, view.el, { _$el: this.$el, _$contents: view.$el }); },
            empty: function empty() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { allowMissingEl: true };
                var view = this.currentView;
                if (!view) {
                    if (this._ensureElement(options)) { this.detachHtml(); }
                    return this;
                }
                var shouldDestroy = !options.preventDestroy;
                if (!shouldDestroy) { deprecate('The preventDestroy option is deprecated. Use Region#detachView'); }
                this._empty(view, shouldDestroy);
                return this;
            },
            _empty: function _empty(view, shouldDestroy) {
                view.off('destroy', this._empty, this);
                this.triggerMethod('before:empty', this, view);
                this._restoreEl();
                delete this.currentView;
                if (!view._isDestroyed) {
                    if (shouldDestroy) { this.removeView(view); } else { this._detachView(view); }
                    this._stopChildViewEvents(view);
                }
                this.triggerMethod('empty', this, view);
            },
            _stopChildViewEvents: function _stopChildViewEvents(view) {
                var parentView = this._parentView;
                if (!parentView) { return; }
                this._parentView.stopListening(view);
            },
            destroyView: function destroyView$$1(view) {
                if (view._isDestroyed) { return view; }
                view._shouldDisableEvents = this._shouldDisableMonitoring();
                destroyView(view);
                return view;
            },
            removeView: function removeView(view) { this.destroyView(view); },
            detachView: function detachView() {
                var view = this.currentView;
                if (!view) { return; }
                this._empty(view);
                return view;
            },
            _detachView: function _detachView(view) {
                var shouldTriggerDetach = view._isAttached && !this._shouldDisableMonitoring();
                var shouldRestoreEl = this._isReplaced;
                if (shouldTriggerDetach) { triggerMethodOn(view, 'before:detach', view); }
                if (shouldRestoreEl) { this.Dom.replaceEl(this.el, view.el); } else { this.detachHtml(); }
                if (shouldTriggerDetach) {
                    view._isAttached = false;
                    triggerMethodOn(view, 'detach', view);
                }
            },
            detachHtml: function detachHtml() { this.Dom.detachContents(this.el, this.$el); },
            hasView: function hasView() { return !!this.currentView; },
            reset: function reset(options) {
                this.empty(options);
                if (this.$el) { this.el = this._initEl; }
                delete this.$el;
                return this;
            },
            destroy: function destroy(options) {
                if (this._isDestroyed) { return this; }
                this.reset(options);
                if (this._name) { this._parentView._removeReferences(this._name); }
                delete this._parentView;
                delete this._name;
                return MarionetteObject.prototype.destroy.apply(this, arguments);
            }
        }, { setDomApi: setDomApi });
        var buildRegion = function(definition, defaults) {
            if (definition instanceof Region) { return definition; }
            return buildRegionFromDefinition(definition, defaults);
        };

        function buildRegionFromDefinition(definition, defaults) {
            var opts = _.extend({}, defaults);
            if (_.isString(definition)) { _.extend(opts, { el: definition }); return buildRegionFromObject(opts); }
            if (_.isFunction(definition)) { _.extend(opts, { regionClass: definition }); return buildRegionFromObject(opts); }
            if (_.isObject(definition)) {
                if (definition.selector) { deprecate('The selector option on a Region definition object is deprecated. Use el to pass a selector string'); }
                _.extend(opts, { el: definition.selector }, definition);
                return buildRegionFromObject(opts);
            }
            throw new MarionetteError({ message: 'Improper region configuration type.', url: 'marionette.region.html#region-configuration-types' });
        }

        function buildRegionFromObject(definition) { var RegionClass = definition.regionClass; var options = _.omit(definition, 'regionClass'); return new RegionClass(options); }
        var RegionsMixin = {
            regionClass: Region,
            _initRegions: function _initRegions() {
                this.regions = this.regions || {};
                this._regions = {};
                this.addRegions(_.result(this, 'regions'));
            },
            _reInitRegions: function _reInitRegions() { _invoke(this._regions, 'reset'); },
            addRegion: function addRegion(name, definition) {
                var regions = {};
                regions[name] = definition;
                return this.addRegions(regions)[name];
            },
            addRegions: function addRegions(regions) {
                if (_.isEmpty(regions)) { return; }
                regions = this.normalizeUIValues(regions, ['selector', 'el']);
                this.regions = _.extend({}, this.regions, regions);
                return this._addRegions(regions);
            },
            _addRegions: function _addRegions(regionDefinitions) {
                var _this = this;
                var defaults = { regionClass: this.regionClass, parentEl: _.partial(_.result, this, 'el') };
                return _.reduce(regionDefinitions, function(regions, definition, name) {
                    regions[name] = buildRegion(definition, defaults);
                    _this._addRegion(regions[name], name);
                    return regions;
                }, {});
            },
            _addRegion: function _addRegion(region, name) {
                this.triggerMethod('before:add:region', this, name, region);
                region._parentView = this;
                region._name = name;
                this._regions[name] = region;
                this.triggerMethod('add:region', this, name, region);
            },
            removeRegion: function removeRegion(name) {
                var region = this._regions[name];
                this._removeRegion(region, name);
                return region;
            },
            removeRegions: function removeRegions() {
                var regions = this._getRegions();
                _.each(this._regions, _.bind(this._removeRegion, this));
                return regions;
            },
            _removeRegion: function _removeRegion(region, name) {
                this.triggerMethod('before:remove:region', this, name, region);
                region.destroy();
                this.triggerMethod('remove:region', this, name, region);
            },
            _removeReferences: function _removeReferences(name) {
                delete this.regions[name];
                delete this._regions[name];
            },
            emptyRegions: function emptyRegions() {
                var regions = this.getRegions();
                _invoke(regions, 'empty');
                return regions;
            },
            hasRegion: function hasRegion(name) { return !!this.getRegion(name); },
            getRegion: function getRegion(name) {
                if (!this._isRendered) { this.render(); }
                return this._regions[name];
            },
            _getRegions: function _getRegions() { return _.clone(this._regions); },
            getRegions: function getRegions() {
                if (!this._isRendered) { this.render(); }
                return this._getRegions();
            },
            showChildView: function showChildView(name, view) {
                var region = this.getRegion(name);
                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) { args[_key - 2] = arguments[_key]; }
                return region.show.apply(region, [view].concat(args));
            },
            detachChildView: function detachChildView(name) { return this.getRegion(name).detachView(); },
            getChildView: function getChildView(name) { return this.getRegion(name).currentView; }
        };
        var Renderer = {
            render: function render(template, data) {
                if (!template) { throw new MarionetteError({ name: 'TemplateNotFoundError', message: 'Cannot render the template since its false, null or undefined.' }); }
                var templateFunc = _.isFunction(template) ? template : TemplateCache.get(template);
                return templateFunc(data);
            }
        };
        var ClassOptions$1 = ['behaviors', 'childViewEventPrefix', 'childViewEvents', 'childViewTriggers', 'collectionEvents', 'events', 'modelEvents', 'regionClass', 'regions', 'template', 'templateContext', 'triggers', 'ui'];
        var View = Backbone.View.extend({
            constructor: function constructor(options) {
                this.render = _.bind(this.render, this);
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$1);
                monitorViewEvents(this);
                this._initBehaviors();
                this._initRegions();
                var args = Array.prototype.slice.call(arguments);
                args[0] = this.options;
                Backbone.View.prototype.constructor.apply(this, args);
                this.delegateEntityEvents();
                this._triggerEventOnBehaviors('initialize', this);
            },
            serializeData: function serializeData() {
                if (!this.model && !this.collection) { return {}; }
                if (this.model) { return this.serializeModel(); }
                return { items: this.serializeCollection() };
            },
            serializeModel: function serializeModel() {
                if (!this.model) { return {}; }
                return _.clone(this.model.attributes);
            },
            serializeCollection: function serializeCollection() {
                if (!this.collection) { return {}; }
                return this.collection.map(function(model) { return _.clone(model.attributes); });
            },
            setElement: function setElement() {
                var hasEl = !!this.el;
                Backbone.View.prototype.setElement.apply(this, arguments);
                if (hasEl) {
                    this._isRendered = this.Dom.hasContents(this.el);
                    this._isAttached = isNodeAttached(this.el);
                }
                if (this._isRendered) { this.bindUIElements(); }
                return this;
            },
            render: function render() {
                if (this._isDestroyed) { return this; }
                this.triggerMethod('before:render', this);
                if (this._isRendered) { this._reInitRegions(); }
                this._renderTemplate();
                this.bindUIElements();
                this._isRendered = true;
                this.triggerMethod('render', this);
                return this;
            },
            _renderTemplate: function _renderTemplate() {
                var template = this.getTemplate();
                if (template === false) { deprecate('template:false is deprecated.  Use _.noop.'); return; }
                var data = this.mixinTemplateContext(this.serializeData());
                var html = this._renderHtml(template, data);
                this.attachElContent(html);
            },
            _renderHtml: function _renderHtml(template, data) { return Renderer.render(template, data, this); },
            getTemplate: function getTemplate() { return this.template; },
            mixinTemplateContext: function mixinTemplateContext() { var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}; var templateContext = _.result(this, 'templateContext'); return _.extend(target, templateContext); },
            attachElContent: function attachElContent(html) { this.Dom.setContents(this.el, html, this.$el); return this; },
            _removeChildren: function _removeChildren() { this.removeRegions(); },
            _getImmediateChildren: function _getImmediateChildren() { return _.chain(this._getRegions()).map('currentView').compact().value(); }
        }, { setRenderer: function setRenderer(renderer) { this.prototype._renderHtml = renderer; return this; }, setDomApi: setDomApi });
        _.extend(View.prototype, ViewMixin, RegionsMixin);
        var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'toArray', 'first', 'initial', 'rest', 'last', 'without', 'isEmpty', 'pluck', 'reduce', 'partition'];
        var emulateCollection = function emulateCollection(object, listProperty) { _.each(methods, function(method) { object[method] = function() { var list = _.result(this, listProperty); var args = Array.prototype.slice.call(arguments); return _[method].apply(_, [list].concat(args)); }; }); };
        var Container = function Container(views) {
            this._views = {};
            this._indexByModel = {};
            this._indexByCustom = {};
            this._updateLength();
            _.each(views, _.bind(this.add, this));
        };
        emulateCollection(Container.prototype, '_getViews');
        _.extend(Container.prototype, {
            _getViews: function _getViews() { return _.values(this._views); },
            add: function add(view, customIndex) { return this._add(view, customIndex)._updateLength(); },
            _add: function _add(view, customIndex) {
                var viewCid = view.cid;
                this._views[viewCid] = view;
                if (view.model) { this._indexByModel[view.model.cid] = viewCid; }
                if (customIndex) { this._indexByCustom[customIndex] = viewCid; }
                return this;
            },
            findByModel: function findByModel(model) { return this.findByModelCid(model.cid); },
            findByModelCid: function findByModelCid(modelCid) { var viewCid = this._indexByModel[modelCid]; return this.findByCid(viewCid); },
            findByCustom: function findByCustom(index) { var viewCid = this._indexByCustom[index]; return this.findByCid(viewCid); },
            findByIndex: function findByIndex(index) { return _.values(this._views)[index]; },
            findByCid: function findByCid(cid) { return this._views[cid]; },
            remove: function remove(view) { return this._remove(view)._updateLength(); },
            _remove: function _remove(view) {
                var viewCid = view.cid;
                if (view.model) { delete this._indexByModel[view.model.cid]; }
                _.some(this._indexByCustom, _.bind(function(cid, key) { if (cid === viewCid) { delete this._indexByCustom[key]; return true; } }, this));
                delete this._views[viewCid];
                return this;
            },
            _updateLength: function _updateLength() { this.length = _.size(this._views); return this; }
        });
        var ClassOptions$3 = ['behaviors', 'childView', 'childViewEventPrefix', 'childViewEvents', 'childViewOptions', 'childViewTriggers', 'collectionEvents', 'events', 'filter', 'emptyView', 'emptyViewOptions', 'modelEvents', 'reorderOnSort', 'sort', 'triggers', 'ui', 'viewComparator'];
        var CollectionView = Backbone.View.extend({
            sort: true,
            constructor: function constructor(options) {
                this.render = _.bind(this.render, this);
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$3);
                monitorViewEvents(this);
                this._initBehaviors();
                this.once('render', this._initialEvents);
                this._initChildViewStorage();
                this._bufferedChildren = [];
                var args = Array.prototype.slice.call(arguments);
                args[0] = this.options;
                Backbone.View.prototype.constructor.apply(this, args);
                this.delegateEntityEvents();
                this._triggerEventOnBehaviors('initialize', this);
            },
            _startBuffering: function _startBuffering() { this._isBuffering = true; },
            _endBuffering: function _endBuffering() {
                var shouldTriggerAttach = this._isAttached && this.monitorViewEvents !== false;
                var triggerOnChildren = shouldTriggerAttach ? this._getImmediateChildren() : [];
                this._isBuffering = false;
                _.each(triggerOnChildren, function(child) { triggerMethodOn(child, 'before:attach', child); });
                this.attachBuffer(this, this._createBuffer());
                _.each(triggerOnChildren, function(child) {
                    child._isAttached = true;
                    triggerMethodOn(child, 'attach', child);
                });
                this._bufferedChildren = [];
            },
            _getImmediateChildren: function _getImmediateChildren() { return _.values(this.children._views); },
            _initialEvents: function _initialEvents() {
                if (this.collection) {
                    this.listenTo(this.collection, 'add', this._onCollectionAdd);
                    this.listenTo(this.collection, 'update', this._onCollectionUpdate);
                    this.listenTo(this.collection, 'reset', this.render);
                    if (this.sort) { this.listenTo(this.collection, 'sort', this._sortViews); }
                }
            },
            _onCollectionAdd: function _onCollectionAdd(child, collection, opts) {
                var index = opts.at !== undefined && (opts.index || collection.indexOf(child));
                if (this.filter || index === false) { index = _.indexOf(this._filteredSortedModels(index), child); }
                if (this._shouldAddChild(child, index)) {
                    this._destroyEmptyView();
                    this._addChild(child, index);
                }
            },
            _onCollectionUpdate: function _onCollectionUpdate(collection, options) {
                var changes = options.changes;
                this._removeChildModels(changes.removed);
            },
            _removeChildModels: function _removeChildModels(models) {
                var removedViews = this._getRemovedViews(models);
                if (!removedViews.length) { return; }
                this.children._updateLength();
                this._updateIndices(removedViews, false);
                if (this.isEmpty()) { this._showEmptyView(); }
            },
            _getRemovedViews: function _getRemovedViews(models) {
                var _this = this;
                return _.reduce(models, function(removingViews, model) {
                    var view = model && _this.children.findByModel(model);
                    if (!view || view._isDestroyed) { return removingViews; }
                    _this._removeChildView(view);
                    removingViews.push(view);
                    return removingViews;
                }, []);
            },
            _removeChildView: function _removeChildView(view) {
                this.triggerMethod('before:remove:child', this, view);
                this.children._remove(view);
                view._shouldDisableEvents = this.monitorViewEvents === false;
                destroyView(view);
                this.stopListening(view);
                this.triggerMethod('remove:child', this, view);
            },
            setElement: function setElement() {
                var hasEl = !!this.el;
                Backbone.View.prototype.setElement.apply(this, arguments);
                if (hasEl) { this._isAttached = isNodeAttached(this.el); }
                return this;
            },
            render: function render() {
                if (this._isDestroyed) { return this; }
                this.triggerMethod('before:render', this);
                this._renderChildren();
                this._isRendered = true;
                this.triggerMethod('render', this);
                return this;
            },
            setFilter: function setFilter(filter) {
                var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                    preventRender = _ref.preventRender;
                var canBeRendered = this._isRendered && !this._isDestroyed;
                var filterChanged = this.filter !== filter;
                var shouldRender = canBeRendered && filterChanged && !preventRender;
                if (shouldRender) {
                    var previousModels = this._filteredSortedModels();
                    this.filter = filter;
                    var models = this._filteredSortedModels();
                    this._applyModelDeltas(models, previousModels);
                } else { this.filter = filter; }
                return this;
            },
            removeFilter: function removeFilter(options) { return this.setFilter(null, options); },
            _applyModelDeltas: function _applyModelDeltas(models, previousModels) {
                var _this2 = this;
                var currentIds = {};
                _.each(models, function(model, index) {
                    var addedChildNotExists = !_this2.children.findByModel(model);
                    if (addedChildNotExists) { _this2._onCollectionAdd(model, _this2.collection, { at: index }); }
                    currentIds[model.cid] = true;
                });
                var removeModels = _.filter(previousModels, function(prevModel) { return !currentIds[prevModel.cid] && _this2.children.findByModel(prevModel); });
                this._removeChildModels(removeModels);
            },
            reorder: function reorder() {
                var _this3 = this;
                var children = this.children;
                var models = this._filteredSortedModels();
                if (!models.length && this._showingEmptyView) { return this; }
                var anyModelsAdded = _.some(models, function(model) { return !children.findByModel(model); });
                if (anyModelsAdded) { this.render(); } else {
                    var filteredOutModels = [];
                    var elsToReorder = _.reduce(this.children._views, function(viewEls, view) {
                        var index = _.indexOf(models, view.model);
                        if (index === -1) { filteredOutModels.push(view.model); return viewEls; }
                        view._index = index;
                        viewEls[index] = view.el;
                        return viewEls;
                    }, new Array(models.length));
                    this.triggerMethod('before:reorder', this);
                    var elBuffer = this.Dom.createBuffer();
                    _.each(elsToReorder, function(el) { _this3.Dom.appendContents(elBuffer, el); });
                    this._appendReorderedChildren(elBuffer);
                    this._removeChildModels(filteredOutModels);
                    this.triggerMethod('reorder', this);
                }
                return this;
            },
            resortView: function resortView() {
                if (this.reorderOnSort) { this.reorder(); } else { this._renderChildren(); }
                return this;
            },
            _sortViews: function _sortViews() { var _this4 = this; var models = this._filteredSortedModels(); var orderChanged = _.find(models, function(item, index) { var view = _this4.children.findByModel(item); return !view || view._index !== index; }); if (orderChanged) { this.resortView(); } },
            _emptyViewIndex: -1,
            _appendReorderedChildren: function _appendReorderedChildren(children) { this.Dom.appendContents(this.el, children, { _$el: this.$el }); },
            _renderChildren: function _renderChildren() {
                if (this._isRendered) {
                    this._destroyEmptyView();
                    this._destroyChildren();
                }
                var models = this._filteredSortedModels();
                if (this.isEmpty({ processedModels: models })) { this._showEmptyView(); } else {
                    this.triggerMethod('before:render:children', this);
                    this._startBuffering();
                    this._showCollection(models);
                    this._endBuffering();
                    this.triggerMethod('render:children', this);
                }
            },
            _createView: function _createView(model, index) { var ChildView = this._getChildView(model); var childViewOptions = this._getChildViewOptions(model, index); var view = this.buildChildView(model, ChildView, childViewOptions); return view; },
            _setupChildView: function _setupChildView(view, index) {
                monitorViewEvents(view);
                this._proxyChildViewEvents(view);
                if (this.sort) { view._index = index; }
            },
            _showCollection: function _showCollection(models) {
                _.each(models, _.bind(this._addChild, this));
                this.children._updateLength();
            },
            _filteredSortedModels: function _filteredSortedModels(addedAt) {
                if (!this.collection || !this.collection.length) { return []; }
                var viewComparator = this.getViewComparator();
                var models = this.collection.models;
                addedAt = Math.min(Math.max(addedAt, 0), models.length - 1);
                if (viewComparator) {
                    var addedModel = void 0;
                    if (addedAt) {
                        addedModel = models[addedAt];
                        models = models.slice(0, addedAt).concat(models.slice(addedAt + 1));
                    }
                    models = this._sortModelsBy(models, viewComparator);
                    if (addedModel) { models.splice(addedAt, 0, addedModel); }
                }
                models = this._filterModels(models);
                return models;
            },
            getViewComparator: function getViewComparator() { return this.viewComparator; },
            _filterModels: function _filterModels(models) {
                var _this5 = this;
                if (this.filter) { models = _.filter(models, function(model, index) { return _this5._shouldAddChild(model, index); }); }
                return models;
            },
            _sortModelsBy: function _sortModelsBy(models, comparator) { if (typeof comparator === 'string') { return _.sortBy(models, function(model) { return model.get(comparator); }); } else if (comparator.length === 1) { return _.sortBy(models, _.bind(comparator, this)); } else { return _.clone(models).sort(_.bind(comparator, this)); } },
            _showEmptyView: function _showEmptyView() {
                var EmptyView = this._getEmptyView();
                if (EmptyView && !this._showingEmptyView) {
                    this._showingEmptyView = true;
                    var model = new Backbone.Model();
                    var emptyViewOptions = this.emptyViewOptions || this.childViewOptions;
                    if (_.isFunction(emptyViewOptions)) { emptyViewOptions = emptyViewOptions.call(this, model, this._emptyViewIndex); }
                    var view = this.buildChildView(model, EmptyView, emptyViewOptions);
                    this.triggerMethod('before:render:empty', this, view);
                    this.addChildView(view, 0);
                    this.triggerMethod('render:empty', this, view);
                }
            },
            _destroyEmptyView: function _destroyEmptyView() {
                if (this._showingEmptyView) {
                    this.triggerMethod('before:remove:empty', this);
                    this._destroyChildren();
                    delete this._showingEmptyView;
                    this.triggerMethod('remove:empty', this);
                }
            },
            _getEmptyView: function _getEmptyView() {
                var emptyView = this.emptyView;
                if (!emptyView) { return; }
                return this._getView(emptyView);
            },
            _getChildView: function _getChildView(child) {
                var childView = this.childView;
                if (!childView) { throw new MarionetteError({ name: 'NoChildViewError', message: 'A "childView" must be specified' }); }
                childView = this._getView(childView, child);
                if (!childView) { throw new MarionetteError({ name: 'InvalidChildViewError', message: '"childView" must be a view class or a function that returns a view class' }); }
                return childView;
            },
            _getView: function _getView(view, child) { if (view.prototype instanceof Backbone.View || view === Backbone.View) { return view; } else if (_.isFunction(view)) { return view.call(this, child); } },
            _addChild: function _addChild(child, index) {
                var view = this._createView(child, index);
                this.addChildView(view, index);
                return view;
            },
            _getChildViewOptions: function _getChildViewOptions(child, index) {
                if (_.isFunction(this.childViewOptions)) { return this.childViewOptions(child, index); }
                return this.childViewOptions;
            },
            addChildView: function addChildView(view, index) {
                this.triggerMethod('before:add:child', this, view);
                this._setupChildView(view, index);
                if (this._isBuffering) { this.children._add(view); } else {
                    this._updateIndices(view, true);
                    this.children.add(view);
                }
                renderView(view);
                this._attachView(view, index);
                this.triggerMethod('add:child', this, view);
                return view;
            },
            _updateIndices: function _updateIndices(views, increment) {
                if (!this.sort) { return; }
                if (!increment) { _.each(_.sortBy(this.children._views, '_index'), function(view, index) { view._index = index; }); return; }
                var view = _.isArray(views) ? _.max(views, '_index') : views;
                if (_.isObject(view)) { _.each(this.children._views, function(laterView) { if (laterView._index >= view._index) { laterView._index += 1; } }); }
            },
            _attachView: function _attachView(view, index) {
                var shouldTriggerAttach = !view._isAttached && !this._isBuffering && this._isAttached && this.monitorViewEvents !== false;
                if (shouldTriggerAttach) { triggerMethodOn(view, 'before:attach', view); }
                this.attachHtml(this, view, index);
                if (shouldTriggerAttach) {
                    view._isAttached = true;
                    triggerMethodOn(view, 'attach', view);
                }
            },
            buildChildView: function buildChildView(child, ChildViewClass, childViewOptions) { var options = _.extend({ model: child }, childViewOptions); return new ChildViewClass(options); },
            removeChildView: function removeChildView(view) {
                if (!view || view._isDestroyed) { return view; }
                this._removeChildView(view);
                this.children._updateLength();
                this._updateIndices(view, false);
                return view;
            },
            isEmpty: function isEmpty(options) {
                var models = void 0;
                if (_.result(options, 'processedModels')) { models = options.processedModels; } else {
                    models = this.collection ? this.collection.models : [];
                    models = this._filterModels(models);
                }
                return models.length === 0;
            },
            attachBuffer: function attachBuffer(collectionView, buffer) { this.Dom.appendContents(collectionView.el, buffer, { _$el: collectionView.$el }); },
            _createBuffer: function _createBuffer() {
                var _this6 = this;
                var elBuffer = this.Dom.createBuffer();
                _.each(this._bufferedChildren, function(b) { _this6.Dom.appendContents(elBuffer, b.el, { _$contents: b.$el }); });
                return elBuffer;
            },
            attachHtml: function attachHtml(collectionView, childView, index) { if (collectionView._isBuffering) { collectionView._bufferedChildren.splice(index, 0, childView); } else { if (!collectionView._insertBefore(childView, index)) { collectionView._insertAfter(childView); } } },
            _insertBefore: function _insertBefore(childView, index) {
                var currentView = void 0;
                var findPosition = this.sort && index < this.children.length - 1;
                if (findPosition) { currentView = _.find(this.children._views, function(view) { return view._index === index + 1; }); }
                if (currentView) { this.beforeEl(currentView.el, childView.el); return true; }
                return false;
            },
            beforeEl: function beforeEl(el, siblings) { this.$(el).before(siblings); },
            _insertAfter: function _insertAfter(childView) { this.Dom.appendContents(this.el, childView.el, { _$el: this.$el, _$contents: childView.$el }); },
            _initChildViewStorage: function _initChildViewStorage() { this.children = new Container(); },
            _removeChildren: function _removeChildren() { this._destroyChildren(); },
            _destroyChildren: function _destroyChildren(options) {
                if (!this.children.length) { return; }
                this.triggerMethod('before:destroy:children', this);
                _.each(this.children._views, _.bind(this._removeChildView, this));
                this.children._updateLength();
                this.triggerMethod('destroy:children', this);
            },
            _shouldAddChild: function _shouldAddChild(child, index) { var filter = this.filter; return !_.isFunction(filter) || filter.call(this, child, index, this.collection); }
        }, { setDomApi: setDomApi });
        _.extend(CollectionView.prototype, ViewMixin);
        var Container$1 = function Container() { this._init(); };
        emulateCollection(Container$1.prototype, '_views');

        function stringComparator(comparator, view) { return view.model && view.model.get(comparator); }
        _.extend(Container$1.prototype, {
            _init: function _init() {
                this._views = [];
                this._viewsByCid = {};
                this._indexByModel = {};
                this._updateLength();
            },
            _add: function _add(view) {
                var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._views.length;
                var viewCid = view.cid;
                this._viewsByCid[viewCid] = view;
                if (view.model) { this._indexByModel[view.model.cid] = viewCid; }
                this._views.splice(index, 0, view);
                this._updateLength();
            },
            _sort: function _sort(comparator) {
                if (typeof comparator === 'string') { comparator = _.partial(stringComparator, comparator); return this._sortBy(comparator); }
                if (comparator.length === 1) { return this._sortBy(comparator); }
                return this._views.sort(comparator);
            },
            _sortBy: function _sortBy(comparator) {
                var sortedViews = _.sortBy(this._views, comparator);
                this._set(sortedViews);
                return sortedViews;
            },
            _set: function _set(views) {
                this._views.length = 0;
                this._views.push.apply(this._views, views.slice(0));
                this._updateLength();
            },
            _swap: function _swap(view1, view2) {
                var view1Index = this.findIndexByView(view1);
                var view2Index = this.findIndexByView(view2);
                if (view1Index === -1 || view2Index === -1) { return; }
                var swapView = this._views[view1Index];
                this._views[view1Index] = this._views[view2Index];
                this._views[view2Index] = swapView;
            },
            findByModel: function findByModel(model) { return this.findByModelCid(model.cid); },
            findByModelCid: function findByModelCid(modelCid) { var viewCid = this._indexByModel[modelCid]; return this.findByCid(viewCid); },
            findByIndex: function findByIndex(index) { return this._views[index]; },
            findIndexByView: function findIndexByView(view) { return this._views.indexOf(view); },
            findByCid: function findByCid(cid) { return this._viewsByCid[cid]; },
            hasView: function hasView(view) { return !!this.findByCid(view.cid); },
            _remove: function _remove(view) {
                if (!this._viewsByCid[view.cid]) { return; }
                if (view.model) { delete this._indexByModel[view.model.cid]; }
                delete this._viewsByCid[view.cid];
                var index = this.findIndexByView(view);
                this._views.splice(index, 1);
                this._updateLength();
            },
            _updateLength: function _updateLength() { this.length = this._views.length; }
        });
        var ClassOptions$4 = ['behaviors', 'childView', 'childViewEventPrefix', 'childViewEvents', 'childViewOptions', 'childViewTriggers', 'collectionEvents', 'emptyView', 'emptyViewOptions', 'events', 'modelEvents', 'sortWithCollection', 'triggers', 'ui', 'viewComparator', 'viewFilter'];
        var CollectionView$2 = Backbone.View.extend({
            sortWithCollection: true,
            constructor: function constructor(options) {
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$4);
                monitorViewEvents(this);
                this.once('render', this._initialEvents);
                this._initChildViewStorage();
                this._initBehaviors();
                var args = Array.prototype.slice.call(arguments);
                args[0] = this.options;
                Backbone.View.prototype.constructor.apply(this, args);
                this.getEmptyRegion();
                this.delegateEntityEvents();
                this._triggerEventOnBehaviors('initialize', this);
            },
            _initChildViewStorage: function _initChildViewStorage() { this.children = new Container$1(); },
            getEmptyRegion: function getEmptyRegion() {
                if (this._emptyRegion && !this._emptyRegion.isDestroyed()) { return this._emptyRegion; }
                this._emptyRegion = new Region({ el: this.el, replaceElement: false });
                this._emptyRegion._parentView = this;
                return this._emptyRegion;
            },
            _initialEvents: function _initialEvents() { this.listenTo(this.collection, { 'sort': this._onCollectionSort, 'reset': this._onCollectionReset, 'update': this._onCollectionUpdate }); },
            _onCollectionSort: function _onCollectionSort() {
                var _this = this;
                if (!this.sortWithCollection || this.viewComparator === false) { return; }
                if (this.collection.length !== this.children.length) { return; }
                var hasAddedModel = this.collection.some(function(model) { return !_this.children.findByModel(model); });
                if (hasAddedModel) { return; }
                this.sort();
            },
            _onCollectionReset: function _onCollectionReset() { this.render(); },
            _onCollectionUpdate: function _onCollectionUpdate(collection, options) {
                var changes = options.changes;
                var removedViews = changes.removed.length && this._removeChildModels(changes.removed);
                this._addedViews = changes.added.length && this._addChildModels(changes.added);
                this._detachChildren(removedViews);
                this._showChildren();
                this._removeChildViews(removedViews);
            },
            _removeChildModels: function _removeChildModels(models) { return _.map(models, _.bind(this._removeChildModel, this)); },
            _removeChildModel: function _removeChildModel(model) {
                var view = this.children.findByModel(model);
                this._removeChild(view);
                return view;
            },
            _removeChild: function _removeChild(view) {
                this.triggerMethod('before:remove:child', this, view);
                this.children._remove(view);
                this.triggerMethod('remove:child', this, view);
            },
            _addChildModels: function _addChildModels(models) { return _.map(models, _.bind(this._addChildModel, this)); },
            _addChildModel: function _addChildModel(model) {
                var view = this._createChildView(model);
                this._addChild(view);
                return view;
            },
            _createChildView: function _createChildView(model) { var ChildView = this._getChildView(model); var childViewOptions = this._getChildViewOptions(model); var view = this.buildChildView(model, ChildView, childViewOptions); return view; },
            _addChild: function _addChild(view, index) {
                this.triggerMethod('before:add:child', this, view);
                this._setupChildView(view);
                this.children._add(view, index);
                this.triggerMethod('add:child', this, view);
            },
            _getChildView: function _getChildView(child) {
                var childView = this.childView;
                if (!childView) { throw new MarionetteError({ name: 'NoChildViewError', message: 'A "childView" must be specified' }); }
                childView = this._getView(childView, child);
                if (!childView) { throw new MarionetteError({ name: 'InvalidChildViewError', message: '"childView" must be a view class or a function that returns a view class' }); }
                return childView;
            },
            _getView: function _getView(view, child) { if (view.prototype instanceof Backbone.View || view === Backbone.View) { return view; } else if (_.isFunction(view)) { return view.call(this, child); } },
            _getChildViewOptions: function _getChildViewOptions(child) {
                if (_.isFunction(this.childViewOptions)) { return this.childViewOptions(child); }
                return this.childViewOptions;
            },
            buildChildView: function buildChildView(child, ChildViewClass, childViewOptions) { var options = _.extend({ model: child }, childViewOptions); return new ChildViewClass(options); },
            _setupChildView: function _setupChildView(view) {
                monitorViewEvents(view);
                view.on('destroy', this.removeChildView, this);
                this._proxyChildViewEvents(view);
            },
            _getImmediateChildren: function _getImmediateChildren() { return this.children._views; },
            setElement: function setElement() {
                var hasEl = !!this.el;
                Backbone.View.prototype.setElement.apply(this, arguments);
                if (hasEl) { this._isAttached = isNodeAttached(this.el); }
                return this;
            },
            render: function render() {
                if (this._isDestroyed) { return this; }
                this.triggerMethod('before:render', this);
                this._destroyChildren();
                this.children._init();
                if (this.collection) { this._addChildModels(this.collection.models); }
                this._showChildren();
                this._isRendered = true;
                this.triggerMethod('render', this);
                return this;
            },
            sort: function sort() {
                if (this._isDestroyed) { return this; }
                if (!this.children.length) { return this; }
                this._showChildren();
                return this;
            },
            _showChildren: function _showChildren() {
                if (this.isEmpty()) { this._showEmptyView(); return; }
                this._sortChildren();
                this.filter();
            },
            isEmpty: function isEmpty(allViewsFiltered) { return allViewsFiltered || !this.children.length; },
            _showEmptyView: function _showEmptyView() {
                var EmptyView = this._getEmptyView();
                if (!EmptyView) { return; }
                var options = this._getEmptyViewOptions();
                var emptyRegion = this.getEmptyRegion();
                emptyRegion.show(new EmptyView(options));
            },
            _getEmptyView: function _getEmptyView() {
                var emptyView = this.emptyView;
                if (!emptyView) { return; }
                return this._getView(emptyView);
            },
            _destroyEmptyView: function _destroyEmptyView() { var emptyRegion = this.getEmptyRegion(); if (emptyRegion.hasView()) { emptyRegion.empty(); } },
            _getEmptyViewOptions: function _getEmptyViewOptions() {
                var emptyViewOptions = this.emptyViewOptions || this.childViewOptions;
                if (_.isFunction(emptyViewOptions)) { return emptyViewOptions.call(this); }
                return emptyViewOptions;
            },
            _sortChildren: function _sortChildren() {
                if (this.viewComparator === false) { return; }
                this.triggerMethod('before:sort', this);
                var viewComparator = this.getComparator();
                if (_.isFunction(viewComparator)) { viewComparator = viewComparator.bind(this); }
                this.children._sort(viewComparator);
                this.triggerMethod('sort', this);
            },
            setComparator: function setComparator(comparator) {
                var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                    preventRender = _ref.preventRender;
                var comparatorChanged = this.viewComparator !== comparator;
                var shouldSort = comparatorChanged && !preventRender;
                this.viewComparator = comparator;
                if (shouldSort) { this.sort(); }
                return this;
            },
            removeComparator: function removeComparator(options) { return this.setComparator(null, options); },
            getComparator: function getComparator() { return this.viewComparator || this._viewComparator; },
            _viewComparator: function _viewComparator(view) {
                if (!this.collection) { return; }
                return this.collection.indexOf(view.model);
            },
            filter: function filter() {
                if (this._isDestroyed) { return this; }
                if (!this.children.length) { return this; }
                var filteredViews = this._filterChildren();
                this._renderChildren(filteredViews);
                return this;
            },
            _isAddedAtEnd: function _isAddedAtEnd(addedView, index, addedViews) { var viewIndex = this.children._views.length - addedViews.length + index; return addedView === this.children._views[viewIndex]; },
            _filterChildren: function _filterChildren() {
                var viewFilter = this._getFilter();
                var addedViews = this._addedViews;
                delete this._addedViews;
                if (!viewFilter) {
                    if (addedViews && _.every(addedViews, _.bind(this._isAddedAtEnd, this))) { return addedViews; }
                    return this.children._views;
                }
                this.triggerMethod('before:filter', this);
                var filteredViews = _.partition(this.children._views, _.bind(viewFilter, this));
                this._detachChildren(filteredViews[1]);
                this.triggerMethod('filter', this);
                return filteredViews[0];
            },
            _getFilter: function _getFilter() {
                var viewFilter = this.getFilter();
                if (!viewFilter) { return false; }
                if (_.isFunction(viewFilter)) { return viewFilter; }
                if (_.isObject(viewFilter)) { var matcher = _.matches(viewFilter); return function(view) { return matcher(view.model && view.model.attributes); }; }
                if (_.isString(viewFilter)) { return function(view) { return view.model && view.model.get(viewFilter); }; }
                throw new MarionetteError({ name: 'InvalidViewFilterError', message: '"viewFilter" must be a function, predicate object literal, a string indicating a model attribute, or falsy' });
            },
            getFilter: function getFilter() { return this.viewFilter; },
            setFilter: function setFilter(filter) {
                var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                    preventRender = _ref2.preventRender;
                var filterChanged = this.viewFilter !== filter;
                var shouldRender = filterChanged && !preventRender;
                this.viewFilter = filter;
                if (shouldRender) { this.filter(); }
                return this;
            },
            removeFilter: function removeFilter(options) { return this.setFilter(null, options); },
            _detachChildren: function _detachChildren(detachingViews) { _.each(detachingViews, _.bind(this._detachChildView, this)); },
            _detachChildView: function _detachChildView(view) {
                var shouldTriggerDetach = view._isAttached && this.monitorViewEvents !== false;
                if (shouldTriggerDetach) { triggerMethodOn(view, 'before:detach', view); }
                this.detachHtml(view);
                if (shouldTriggerDetach) {
                    view._isAttached = false;
                    triggerMethodOn(view, 'detach', view);
                }
            },
            detachHtml: function detachHtml(view) { this.Dom.detachEl(view.el, view.$el); },
            _renderChildren: function _renderChildren(views) {
                if (this.isEmpty(!views.length)) { this._showEmptyView(); return; }
                this._destroyEmptyView();
                this.triggerMethod('before:render:children', this, views);
                var els = this._getBuffer(views);
                this._attachChildren(els, views);
                this.triggerMethod('render:children', this, views);
            },
            _attachChildren: function _attachChildren(els, views) {
                var shouldTriggerAttach = this._isAttached && this.monitorViewEvents !== false;
                views = shouldTriggerAttach ? views : [];
                _.each(views, function(view) {
                    if (view._isAttached) { return; }
                    triggerMethodOn(view, 'before:attach', view);
                });
                this.attachHtml(els);
                _.each(views, function(view) {
                    if (view._isAttached) { return; }
                    view._isAttached = true;
                    triggerMethodOn(view, 'attach', view);
                });
            },
            _getBuffer: function _getBuffer(views) {
                var _this2 = this;
                var elBuffer = this.Dom.createBuffer();
                _.each(views, function(view) {
                    renderView(view);
                    _this2.Dom.appendContents(elBuffer, view.el, { _$contents: view.$el });
                });
                return elBuffer;
            },
            attachHtml: function attachHtml(els) { this.Dom.appendContents(this.el, els, { _$el: this.$el }); },
            swapChildViews: function swapChildViews(view1, view2) {
                if (!this.children.hasView(view1) || !this.children.hasView(view2)) { throw new MarionetteError({ name: 'ChildSwapError', message: 'Both views must be children of the collection view' }); }
                this.children._swap(view1, view2);
                this.Dom.swapEl(view1.el, view2.el);
                if (this.Dom.hasEl(this.el, view1.el) !== this.Dom.hasEl(this.el, view2.el)) { this.filter(); }
                return this;
            },
            addChildView: function addChildView(view, index) {
                if (!view || view._isDestroyed) { return view; }
                this._addChild(view, index);
                this._addedViews = [view];
                this._showChildren();
                return view;
            },
            detachChildView: function detachChildView(view) { this.removeChildView(view, { shouldDetach: true }); return view; },
            removeChildView: function removeChildView(view, options) {
                if (!view) { return view; }
                this._removeChildView(view, options);
                this._removeChild(view);
                if (this.isEmpty()) { this._showEmptyView(); }
                return view;
            },
            _removeChildViews: function _removeChildViews(views) { _.each(views, _.bind(this._removeChildView, this)); },
            _removeChildView: function _removeChildView(view) {
                var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                    shouldDetach = _ref3.shouldDetach;
                view.off('destroy', this.removeChildView, this);
                if (shouldDetach) { this._detachChildView(view); } else { this._destroyChildView(view); }
                this.stopListening(view);
            },
            _destroyChildView: function _destroyChildView(view) {
                if (view._isDestroyed) { return; }
                view._shouldDisableEvents = this.monitorViewEvents === false;
                destroyView(view);
            },
            _removeChildren: function _removeChildren() {
                this._destroyChildren();
                var emptyRegion = this.getEmptyRegion();
                emptyRegion.destroy();
                delete this._addedViews;
            },
            _destroyChildren: function _destroyChildren() {
                if (!this.children || !this.children.length) { return; }
                this.triggerMethod('before:destroy:children', this);
                if (this.monitorViewEvents === false) { this.Dom.detachContents(this.el, this.$el); }
                _.each(this.children._views, _.bind(this._removeChildView, this));
                this.triggerMethod('destroy:children', this);
            }
        }, { setDomApi: setDomApi });
        _.extend(CollectionView$2.prototype, ViewMixin);
        var ClassOptions$5 = ['childViewContainer', 'template', 'templateContext'];
        var CompositeView = CollectionView.extend({
            constructor: function constructor(options) {
                deprecate('CompositeView is deprecated. Convert to View at your earliest convenience');
                this.mergeOptions(options, ClassOptions$5);
                CollectionView.prototype.constructor.apply(this, arguments);
            },
            _initialEvents: function _initialEvents() {
                if (this.collection) {
                    this.listenTo(this.collection, 'add', this._onCollectionAdd);
                    this.listenTo(this.collection, 'update', this._onCollectionUpdate);
                    this.listenTo(this.collection, 'reset', this.renderChildren);
                    if (this.sort) { this.listenTo(this.collection, 'sort', this._sortViews); }
                }
            },
            _getChildView: function _getChildView(child) {
                var childView = this.childView;
                if (!childView) { return this.constructor; }
                childView = this._getView(childView, child);
                if (!childView) { throw new MarionetteError({ name: 'InvalidChildViewError', message: '"childView" must be a view class or a function that returns a view class' }); }
                return childView;
            },
            serializeData: function serializeData() { return this.serializeModel(); },
            render: function render() {
                if (this._isDestroyed) { return this; }
                this._isRendering = true;
                this.resetChildViewContainer();
                this.triggerMethod('before:render', this);
                this._renderTemplate();
                this.bindUIElements();
                this.renderChildren();
                this._isRendering = false;
                this._isRendered = true;
                this.triggerMethod('render', this);
                return this;
            },
            renderChildren: function renderChildren() { if (this._isRendered || this._isRendering) { CollectionView.prototype._renderChildren.call(this); } },
            attachBuffer: function attachBuffer(compositeView, buffer) {
                var $container = this.getChildViewContainer(compositeView);
                this.Dom.appendContents($container[0], buffer, { _$el: $container });
            },
            _insertAfter: function _insertAfter(childView) {
                var $container = this.getChildViewContainer(this, childView);
                this.Dom.appendContents($container[0], childView.el, { _$el: $container, _$contents: childView.$el });
            },
            _appendReorderedChildren: function _appendReorderedChildren(children) {
                var $container = this.getChildViewContainer(this);
                this.Dom.appendContents($container[0], children, { _$el: $container });
            },
            getChildViewContainer: function getChildViewContainer(containerView, childView) {
                if (!!containerView.$childViewContainer) { return containerView.$childViewContainer; }
                var container = void 0;
                var childViewContainer = containerView.childViewContainer;
                if (childViewContainer) {
                    var selector = _.result(containerView, 'childViewContainer');
                    if (selector.charAt(0) === '@' && containerView.ui) { container = containerView.ui[selector.substr(4)]; } else { container = this.$(selector); }
                    if (container.length <= 0) { throw new MarionetteError({ name: 'ChildViewContainerMissingError', message: 'The specified "childViewContainer" was not found: ' + containerView.childViewContainer }); }
                } else { container = containerView.$el; }
                containerView.$childViewContainer = container;
                return container;
            },
            resetChildViewContainer: function resetChildViewContainer() { if (this.$childViewContainer) { this.$childViewContainer = undefined; } }
        });
        var MixinFromView = _.pick(View.prototype, 'serializeModel', 'getTemplate', '_renderTemplate', '_renderHtml', 'mixinTemplateContext', 'attachElContent');
        _.extend(CompositeView.prototype, MixinFromView);
        var ClassOptions$6 = ['collectionEvents', 'events', 'modelEvents', 'triggers', 'ui'];
        var Behavior = MarionetteObject.extend({
            cidPrefix: 'mnb',
            constructor: function constructor(options, view) {
                this.view = view;
                if (this.defaults) { deprecate('Behavior defaults are deprecated. For similar functionality set options on the Behavior class.'); }
                this.defaults = _.clone(_.result(this, 'defaults', {}));
                this._setOptions(_.extend({}, this.defaults, options));
                this.mergeOptions(this.options, ClassOptions$6);
                this.ui = _.extend({}, _.result(this, 'ui'), _.result(view, 'ui'));
                MarionetteObject.apply(this, arguments);
            },
            $: function $() { return this.view.$.apply(this.view, arguments); },
            destroy: function destroy() {
                this.stopListening();
                this.view._removeBehavior(this);
                return this;
            },
            proxyViewProperties: function proxyViewProperties() {
                this.$el = this.view.$el;
                this.el = this.view.el;
                return this;
            },
            bindUIElements: function bindUIElements() { this._bindUIElements(); return this; },
            unbindUIElements: function unbindUIElements() { this._unbindUIElements(); return this; },
            getUI: function getUI(name) { return this._getUI(name); },
            delegateEntityEvents: function delegateEntityEvents() { this._delegateEntityEvents(this.view.model, this.view.collection); return this; },
            undelegateEntityEvents: function undelegateEntityEvents() { this._undelegateEntityEvents(this.view.model, this.view.collection); return this; },
            getEvents: function getEvents() {
                var _this = this;
                var behaviorEvents = this.normalizeUIKeys(_.result(this, 'events'));
                return _.reduce(behaviorEvents, function(events, behaviorHandler, key) {
                    if (!_.isFunction(behaviorHandler)) { behaviorHandler = _this[behaviorHandler]; }
                    if (!behaviorHandler) { return; }
                    key = getUniqueEventName(key);
                    events[key] = _.bind(behaviorHandler, _this);
                    return events;
                }, {});
            },
            getTriggers: function getTriggers() {
                if (!this.triggers) { return; }
                var behaviorTriggers = this.normalizeUIKeys(_.result(this, 'triggers'));
                return this._getViewTriggers(this.view, behaviorTriggers);
            }
        });
        _.extend(Behavior.prototype, DelegateEntityEventsMixin, TriggersMixin, UIMixin);
        var ClassOptions$7 = ['region', 'regionClass'];
        var Application = MarionetteObject.extend({
            cidPrefix: 'mna',
            constructor: function constructor(options) {
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$7);
                this._initRegion();
                MarionetteObject.prototype.constructor.apply(this, arguments);
            },
            regionClass: Region,
            _initRegion: function _initRegion() {
                var region = this.region;
                if (!region) { return; }
                var defaults = { regionClass: this.regionClass };
                this._region = buildRegion(region, defaults);
            },
            getRegion: function getRegion() { return this._region; },
            showView: function showView(view) {
                var region = this.getRegion();
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
                return region.show.apply(region, [view].concat(args));
            },
            getView: function getView() { return this.getRegion().currentView; },
            start: function start(options) {
                this.triggerMethod('before:start', this, options);
                this.triggerMethod('start', this, options);
                return this;
            }
        });
        var ClassOptions$8 = ['appRoutes', 'controller'];
        var AppRouter = Backbone.Router.extend({
            constructor: function constructor(options) {
                this._setOptions(options);
                this.mergeOptions(options, ClassOptions$8);
                Backbone.Router.apply(this, arguments);
                var appRoutes = this.appRoutes;
                var controller = this._getController();
                this.processAppRoutes(controller, appRoutes);
                this.on('route', this._processOnRoute, this);
            },
            appRoute: function appRoute(route, methodName) {
                var controller = this._getController();
                this._addAppRoute(controller, route, methodName);
                return this;
            },
            _processOnRoute: function _processOnRoute(routeName, routeArgs) {
                if (_.isFunction(this.onRoute)) {
                    var routePath = _.invert(this.appRoutes)[routeName];
                    this.onRoute(routeName, routePath, routeArgs);
                }
            },
            processAppRoutes: function processAppRoutes(controller, appRoutes) {
                var _this = this;
                if (!appRoutes) { return this; }
                var routeNames = _.keys(appRoutes).reverse();
                _.each(routeNames, function(route) { _this._addAppRoute(controller, route, appRoutes[route]); });
                return this;
            },
            _getController: function _getController() { return this.controller; },
            _addAppRoute: function _addAppRoute(controller, route, methodName) {
                var method = controller[methodName];
                if (!method) { throw new MarionetteError('Method "' + methodName + '" was not found on the controller'); }
                this.route(route, methodName, _.bind(method, controller));
            },
            triggerMethod: triggerMethod
        });
        _.extend(AppRouter.prototype, CommonMixin);

        function behaviorsLookup() { throw new MarionetteError({ message: 'You must define where your behaviors are stored.', url: 'marionette.behaviors.md#behaviorslookup' }); }
        var previousMarionette = Backbone.Marionette;
        var Marionette = Backbone.Marionette = {};
        Marionette.noConflict = function() { Backbone.Marionette = previousMarionette; return this; };
        Marionette.bindEvents = proxy(bindEvents);
        Marionette.unbindEvents = proxy(unbindEvents);
        Marionette.bindRequests = proxy(bindRequests);
        Marionette.unbindRequests = proxy(unbindRequests);
        Marionette.mergeOptions = proxy(mergeOptions);
        Marionette.getOption = proxy(getOption);
        Marionette.normalizeMethods = proxy(normalizeMethods);
        Marionette.extend = extend;
        Marionette.isNodeAttached = isNodeAttached;
        Marionette.deprecate = deprecate;
        Marionette.triggerMethod = proxy(triggerMethod);
        Marionette.triggerMethodOn = triggerMethodOn;
        Marionette.isEnabled = isEnabled;
        Marionette.setEnabled = setEnabled;
        Marionette.monitorViewEvents = monitorViewEvents;
        Marionette.Behaviors = {};
        Marionette.Behaviors.behaviorsLookup = behaviorsLookup;
        Marionette.Application = Application;
        Marionette.AppRouter = AppRouter;
        Marionette.Renderer = Renderer;
        Marionette.TemplateCache = TemplateCache;
        Marionette.View = View;
        Marionette.CollectionView = CollectionView;
        Marionette.NextCollectionView = CollectionView$2;
        Marionette.CompositeView = CompositeView;
        Marionette.Behavior = Behavior;
        Marionette.Region = Region;
        Marionette.Error = MarionetteError;
        Marionette.Object = MarionetteObject;
        Marionette.DEV_MODE = false;
        Marionette.FEATURES = FEATURES;
        Marionette.VERSION = version;
        Marionette.DomApi = DomApi;
        Marionette.setDomApi = function(mixin) {
            CollectionView.setDomApi(mixin);
            CompositeView.setDomApi(mixin);
            CollectionView$2.setDomApi(mixin);
            Region.setDomApi(mixin);
            View.setDomApi(mixin);
        };
        return Marionette;
        console.log(Marionette);
    })));
    this._ = previousUnderscore;
    this.Backbone = previousBackbone;
    this.Radio = previousRadio;
    this && this.Marionette && (this.Mn = this.Marionette); //# sourceMappingURL=backbone.marionette.js.map

})