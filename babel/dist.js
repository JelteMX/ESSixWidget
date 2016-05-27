'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _declare = require('dojo/_base/declare');

var _declare2 = _interopRequireDefault(_declare);

var _WidgetBase2 = require('dijit/_WidgetBase');

var _WidgetBase3 = _interopRequireDefault(_WidgetBase2);

var _TemplatedMixin2 = require('dijit/_TemplatedMixin');

var _TemplatedMixin3 = _interopRequireDefault(_TemplatedMixin2);

var _event = require('dojo/_base/event');

var _event2 = _interopRequireDefault(_event);

var _domStyle = require('dojo/dom-style');

var _domStyle2 = _interopRequireDefault(_domStyle);

var _html = require('dojo/html');

var _html2 = _interopRequireDefault(_html);

var _domConstruct = require('dojo/dom-construct');

var _domConstruct2 = _interopRequireDefault(_domConstruct);

var _jquery = require('EsSixWidget/lib/jquery-1.11.2');

var _jquery2 = _interopRequireDefault(_jquery);

var _EsSixWidget = require('dojo/text!EsSixWidget/widget/template/EsSixWidget.html');

var _EsSixWidget2 = _interopRequireDefault(_EsSixWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = _jquery2.default.noConflict();
exports.default = (0, _declare2.default)("EsSixWidget.widget.EsSixWidget", [_WidgetBase3.default, _TemplatedMixin3.default], {
    templateString: _EsSixWidget2.default,

    // DOM elements
    inputNodes: null,
    colorSelectNode: null,
    colorInputNode: null,
    infoTextNode: null,

    // Parameters configured in the Modeler.
    mfToExecute: "",
    messageString: "",
    backgroundColor: "",

    // Internal variables.
    _handles: null,
    _contextObj: null,
    _alertDiv: null,
    _readOnly: false,

    constructor: function constructor() {
        this._handles = [];
    },
    postCreate: function postCreate() {
        logger.debug(this.id + ".postCreate");

        if (this.readOnly || this.get("disabled") || this.readonly) this._readOnly = true;

        this._updateRendering();
        this._setupEvents();
    },
    update: function update(obj, callback) {
        logger.debug(this.id + ".update");

        this._contextObj = obj;
        this._resetSubscriptions();
        this._updateRendering(callback);
    },
    enable: function enable() {
        logger.debug(this.id + ".enable");
    },
    disable: function disable() {
        logger.debug(this.id + ".disable");
    },
    resize: function resize() {
        logger.debug(this.id + ".resize");
    },
    uninitialize: function uninitialize() {
        logger.debug(this.id + ".uninitialize");
    },


    // Rerender the interface.
    _updateRendering: function _updateRendering(callback) {
        logger.debug(this.id + "._updateRendering");
        this.colorSelectNode.disabled = this._readOnly;
        this.colorInputNode.disabled = this._readOnly;

        if (this._contextObj !== null) {
            _domStyle2.default.set(this.domNode, "display", "block");

            var colorValue = this._contextObj.get(this.backgroundColor);

            this.colorInputNode.value = colorValue;
            this.colorSelectNode.value = colorValue;

            _html2.default.set(this.infoTextNode, this.messageString);
            _domStyle2.default.set(this.infoTextNode, "background-color", colorValue);
        } else {
            _domStyle2.default.set(this.domNode, "display", "none");
        }

        this._clearValidations();

        mendix.lang.nullExec(callback);
    },
    _stopBubblingEventOnMobile: function _stopBubblingEventOnMobile(e) {
        logger.debug(this.id + "._stopBubblingEventOnMobile");
        if (typeof document.ontouchstart !== "undefined") {
            _event2.default.stop(e);
        }
    },
    _setupEvents: function _setupEvents() {
        var _this = this;

        logger.debug(this.id + "._setupEvents");
        this.connect(this.colorSelectNode, "change", function (e) {
            _this._contextObj.set(_this.backgroundColor, _this.colorSelectNode.value);
        });

        this.connect(this.infoTextNode, "click", function (e) {
            _this._stopBubblingEventOnMobile(e);

            if (_this.mfToExecute !== "") {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: _this.mfToExecute,
                        guids: [_this._contextObj.getGuid()]
                    },
                    store: {
                        caller: _this.mxform
                    },
                    callback: function callback(obj) {
                        //TODO what to do when all is ok!
                    },

                    error: function error(_error) {
                        logger.error(_this.id + ": An error occurred while executing microflow: " + _error.description);
                    }
                }, _this);
            }
        });
    },
    _handleValidation: function _handleValidation(validations) {
        logger.debug(this.id + "._handleValidation");
        this._clearValidations();

        var validation = validations[0],
            message = validation.getReasonByAttribute(this.backgroundColor);

        if (this._readOnly) {
            validation.removeAttribute(this.backgroundColor);
        } else if (message) {
            this._addValidation(message);
            validation.removeAttribute(this.backgroundColor);
        }
    },
    _clearValidations: function _clearValidations() {
        logger.debug(this.id + "._clearValidations");
        _domConstruct2.default.destroy(this._alertDiv);
        this._alertDiv = null;
    },
    _showError: function _showError(message) {
        logger.debug(this.id + "._showError");
        if (this._alertDiv !== null) {
            _html2.default.set(this._alertDiv, message);
            return true;
        }
        this._alertDiv = _domConstruct2.default.create("div", {
            "class": "alert alert-danger",
            "innerHTML": message
        });
        _domConstruct2.default.place(this._alertDiv, this.domNode);
    },
    _addValidation: function _addValidation(message) {
        logger.debug(this.id + "._addValidation");
        this._showError(message);
    },
    _unsubscribe: function _unsubscribe() {
        if (this._handles) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._handles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var handle = _step.value;

                    mx.data.unsubscribe(handle);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this._handles = [];
        }
    },
    _resetSubscriptions: function _resetSubscriptions() {
        var _this2 = this;

        logger.debug(this.id + "._resetSubscriptions");

        this._unsubscribe();

        if (this._contextObj) {
            var objectHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                callback: function callback(guid) {
                    _this2._updateRendering();
                }
            });

            var attrHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.backgroundColor,
                callback: function callback(guid, attr, attrValue) {
                    _this2._updateRendering();
                }
            });

            var validationHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                val: true,
                callback: function callback() {
                    return _this2._handleValidation;
                }
            });

            this._handles = [objectHandle, attrHandle, validationHandle];
        }
    }
});


require(["EsSixWidget/widget/EsSixWidget"]);
//# sourceMappingURL=dist.js.map
