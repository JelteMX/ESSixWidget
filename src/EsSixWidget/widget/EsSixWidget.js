import declare from 'dojo/_base/declare'
import _WidgetBase from 'dijit/_WidgetBase'
import _TemplatedMixin from 'dijit/_TemplatedMixin'
import dojoEvent from 'dojo/_base/event'
import dojoStyle from 'dojo/dom-style'
import dojoHtml from  'dojo/html'
import dojoConstruct from 'dojo/dom-construct'
import _jQuery from 'EsSixWidget/lib/jquery-1.11.2'
import template from 'dojo/text!EsSixWidget/widget/template/EsSixWidget.html'

const $ = _jQuery.noConflict()
export default declare("EsSixWidget.widget.EsSixWidget", [_WidgetBase, _TemplatedMixin], {
    templateString: template,

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

    constructor() {
        this._handles = []
    },

    postCreate() {
        logger.debug(this.id + ".postCreate")

        if (this.readOnly || this.get("disabled") || this.readonly)
            this._readOnly = true

        this._updateRendering()
        this._setupEvents()
    },

    update(obj, callback) {
        logger.debug(this.id + ".update")

        this._contextObj = obj
        this._resetSubscriptions()
        this._updateRendering(callback)
    },

    enable() {
        logger.debug(this.id + ".enable")
    },

    disable() {
        logger.debug(this.id + ".disable")
    },

    resize() {
        logger.debug(this.id + ".resize")
    },

    uninitialize() {
        logger.debug(this.id + ".uninitialize")
    },

    // Rerender the interface.
    _updateRendering(callback) {
        logger.debug(this.id + "._updateRendering")
        this.colorSelectNode.disabled = this._readOnly
        this.colorInputNode.disabled = this._readOnly

        if (this._contextObj !== null) {
            dojoStyle.set(this.domNode, "display", "block")

            var colorValue = this._contextObj.get(this.backgroundColor)

            this.colorInputNode.value = colorValue
            this.colorSelectNode.value = colorValue

            dojoHtml.set(this.infoTextNode, this.messageString)
            dojoStyle.set(this.infoTextNode, "background-color", colorValue)
        } else {
            dojoStyle.set(this.domNode, "display", "none")
        }

        this._clearValidations()

        mendix.lang.nullExec(callback)
    },

    _stopBubblingEventOnMobile(e) {
        logger.debug(this.id + "._stopBubblingEventOnMobile")
        if (typeof document.ontouchstart !== "undefined") {
            dojoEvent.stop(e)
        }
    },

    _setupEvents() {
        logger.debug(this.id + "._setupEvents")
        this.connect(this.colorSelectNode, "change", (e) => {
            this._contextObj.set(this.backgroundColor, this.colorSelectNode.value)
        })

        this.connect(this.infoTextNode, "click", (e) => {
            this._stopBubblingEventOnMobile(e)

            if (this.mfToExecute !== "") {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.mfToExecute,
                        guids: [ this._contextObj.getGuid() ]
                    },
                    store: {
                        caller: this.mxform
                    },
                    callback(obj) {
                        //TODO what to do when all is ok!
                    },
                    error: (error) => {
                        logger.error(this.id + ": An error occurred while executing microflow: " + error.description)
                    }
                }, this)
            }
        })
    },

    _handleValidation(validations) {
        logger.debug(this.id + "._handleValidation")
        this._clearValidations()

        var validation = validations[0],
            message = validation.getReasonByAttribute(this.backgroundColor)

        if (this._readOnly) {
            validation.removeAttribute(this.backgroundColor)
        } else if (message) {
            this._addValidation(message)
            validation.removeAttribute(this.backgroundColor)
        }
    },

    _clearValidations() {
        logger.debug(this.id + "._clearValidations")
        dojoConstruct.destroy(this._alertDiv)
        this._alertDiv = null
    },

    _showError(message) {
        logger.debug(this.id + "._showError")
        if (this._alertDiv !== null) {
            dojoHtml.set(this._alertDiv, message)
            return true
        }
        this._alertDiv = dojoConstruct.create("div", {
            "class": "alert alert-danger",
            "innerHTML": message
        })
        dojoConstruct.place(this._alertDiv, this.domNode)
    },

    _addValidation(message) {
        logger.debug(this.id + "._addValidation")
        this._showError(message)
    },

    _unsubscribe() {
      if (this._handles) {
          for (var handle of this._handles){
              mx.data.unsubscribe(handle)
          }

          this._handles = []
      }
    },

    _resetSubscriptions() {
        logger.debug(this.id + "._resetSubscriptions")

        this._unsubscribe()

        if (this._contextObj) {
            var objectHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                callback: (guid) => {
                    this._updateRendering()
                }
            })

            var attrHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.backgroundColor,
                callback: (guid, attr, attrValue) => {
                    this._updateRendering()
                }
            })

            var validationHandle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                val: true,
                callback: () => this._handleValidation
            })

            this._handles = [ objectHandle, attrHandle, validationHandle ]
        }
    }

})

require(["EsSixWidget/widget/EsSixWidget"])
