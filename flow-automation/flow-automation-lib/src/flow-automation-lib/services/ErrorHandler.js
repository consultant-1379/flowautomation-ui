define([
    'widgets/Dialog',
    'container/api',
    'widgets/InlineMessage',
    'widgets/Accordion',
    'i18n!flow-automation-lib/dictionary.json'
], function (Dialog, container, InlineMessage, Accordion, dictionary) {

    var inlineMessage;
    var genericDialogBox;

    function _removeInline() {
        if (inlineMessage) {
            inlineMessage.destroy();
        }
    }

    function _formatAccordionIfExits(accordion) {
        if (accordion) {
            var accordionBody = accordion.getElement().getNative().children[1];
            // Used to format the error message to not ignore new lines
            accordionBody.style.whiteSpace = "pre";
            //Used to add scroll bar to accordion rather than the dialog box
            genericDialogBox.getElement().getNative().children[0].children[0].children[0].children[0].style.overflow = "hidden";
            accordionBody.style.overflow = "scroll";
            accordionBody.style.height = "80px";
        }
    }

    function _genericDialogBox(header, content, accordion, dialog) {

        if (genericDialogBox) {
            genericDialogBox.hide();
            genericDialogBox.destroy();
        }

        genericDialogBox = new Dialog({
            type: 'error',
            header: header,
            content: accordion ? dictionary.errorResponse.jsonValidationError : content,
            optionalContent: accordion,
            buttons: [{
                caption: dictionary.get('flow.ok'),
                action: function () {
                    genericDialogBox.hide();
                    if (dialog) {
                        dialog.show();
                    }
                },
                color: 'darkBlue'
            }]
        });
        _formatAccordionIfExits(accordion);
        genericDialogBox.show();
        return genericDialogBox;
    }

    return {
        error: function (errorBody, dialog, errorMsg) {
            return _genericDialogBox(errorMsg, errorBody.userMessage.body, undefined, dialog);
        },

        validationError: function(validationHeader, validationText) {
            return _genericDialogBox(validationHeader, validationText, undefined, false);
        },

        flowStatus: function (errorBody, errorMessage) {
            return _genericDialogBox(errorMessage, errorBody.userMessage.body, undefined, false);
        },

        userTask: function (errorBody) {
            return _genericDialogBox(errorBody.userMessage.title, errorBody.userMessage.body, undefined, false);
        },

        onComplete: function (errorBody, reasonPhrase) {
            var accordion;
            if (reasonPhrase.includes(dictionary.get('errorDialogBox.message'))) {
                accordion = new Accordion({
                    title: dictionary.get('errorDialogBox.viewErrorDetails'),
                    content: reasonPhrase
                });
            }
            return _genericDialogBox(errorBody, reasonPhrase, accordion, false);
        },

        inlineErrorMessage: function (error) {
            _removeInline();
            inlineMessage = new InlineMessage({
                icon: 'error',
                header: error.userMessage.title,
                description: error.userMessage.body
            });
            return inlineMessage;
        },

        reportInlineErrorMessage: function (message, icon) {
            _removeInline();
            var messageIcon = icon ? icon : 'infoMsgIndicator';
            inlineMessage = new InlineMessage({
                icon: messageIcon,
                header: message
            });
            return inlineMessage;
        },

        fullScreenError: function (error) {
            container.getEventBus().publish('container:error', {
                "header": error.userMessage.title,
                "content": error.userMessage.body
            });
        },

        errorMessageTranslator: function (inlineMsg, responseError) {
            var errors = JSON.parse(responseError).errors;

            if (inlineMsg) {
                inlineMsg.destroy();
            }

            if (errors) {
                var message = "";
                errors.forEach(function (error) {
                    var i18nErrorMessage = dictionary.get("errorCodes." + error.code);
                    if (i18nErrorMessage) {
                        message += i18nErrorMessage;
                    } else {
                        message += error.errorMessage;
                    }
                });

                inlineMsg = new InlineMessage({
                    icon: 'infoMsgIndicator',
                    header: message
                });


                return inlineMsg;
            }
        }
    };
});