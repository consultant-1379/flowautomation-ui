define(['widgets/InfoPopup', 'widgets/Tooltip', 'i18n!flow-instance-details/dictionary.json'],
    function (InfoPopup, Tooltip, dictionary) {

        function getElementInner(view, parentClass) {
            return view.getElement().find('.' + parentClass + '-inner-description');
        }

        /**
         * This method will force the change the css to provide some show/hidden behaviour and centralize icon
         * @param parentClass contains the parent class name that will be used to change the css
         */
        function changeCSS(parentClass) {
            var parentClassInner = '.' + parentClass + '-inner';
            var innerClass = parentClassInner + '-description';
            var selectedClass = innerClass + '-selected';

            var newCssStyle = parentClassInner + ':hover ' + innerClass + ' { opacity: 0.4; } ' +
                innerClass + ' { padding-left: 12px; padding-top: 2px; opacity: 0; } ' +
                selectedClass + ' { padding-left: 12px; padding-top: 2px; opacity: 0.4; } ';
            try {
                var style = document.createElement('style');
                style.innerHTML = newCssStyle;
                document.head.appendChild(style);
            } catch (e) {
                console.error("error trying to add css for description pop up");
            }
        }

        return {
            /**
             * Will create the description, must add  <div class="eaFlowInstanceDetails-wChoice-inner-description"></div>
             * @param content information that will be show
             * @param view scope variable with the view page
             * @param parentClass provide the name of the parent class e.g. 'eaFlowInstanceDetails-wChoice'
             */
            createDescriptionPopUp: function (content, view, parentClass) {
                var popup = new InfoPopup({
                    content: content,
                    style: '{z-index: 99999}'
                });
                changeCSS(parentClass);
                var elementInner = getElementInner(view, parentClass);
                popup.attachTo(elementInner);
                var tooltip = new Tooltip({
                    parent: elementInner,
                    contentText: dictionary.get("showInfo")
                });
                popup.addEventHandler("show", function () {
                    tooltip.destroy();
                    getElementInner(view, parentClass).setAttribute('class', parentClass + '-inner-description ' + parentClass + '-inner-description-selected');
                });
                popup.addEventHandler("hide", function () {
                    tooltip = new Tooltip({
                        parent: elementInner,
                        contentText: dictionary.get("showInfo")
                    });
                    getElementInner(view, parentClass).setAttribute('class', parentClass + '-inner-description');
                });
            }
        };
    });