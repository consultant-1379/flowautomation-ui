define([], function () {

    var INFORMATIONAL_FORMATS = ['informational-link', 'informational-table'];

    function walkSchema(schema) {

        var walkObject = function (PROPS) {
            if (PROPS.format === 'checkbox' && PROPS.type === 'object' && PROPS.returnValue === false) {
                return;
            }

            var child = {};
            if (PROPS.format === 'radio') {
                child = handleOneOf(PROPS);
            } else if (PROPS.format === 'file') {
                child[Object.keys(PROPS.properties)[0]] = PROPS.returnValue;
            } else {
                child = buildObject(PROPS);
            }

            return child;
        };

        function isInformationalProperty(format) {
            return INFORMATIONAL_FORMATS.includes(format);
        }

        var buildObject = function (PROPS) {
            var child = {};
            var properties = PROPS.properties;
            var required = PROPS.required;
            for (var key in properties) {
                // Ignore NOT required properties
                if (required) {
                    if (!required.includes(key)) {
                        //continue;
                    }
                }
                switch (properties[key].type) {
                    case "boolean":
                        child[key] = properties[key].returnValue;
                        break;
                    case "integer":
                    case "number":
                        child[key] = properties[key].returnValue || 0;
                        break;
                    case "array":
                        if (isInformationalProperty(properties[key].format)) {
                            break;
                        } else if(properties[key].readOnly && properties[key].readOnly === true){
                            break;
                        } else if (properties[key].format && properties[key].format === 'select-table') {
                            child[key] = handleSelectTable(properties[key]);
                        } else if (properties[key].format && properties[key].format === 'informational-table') {
                            child[key] = properties[key].default;
                        } else if (properties[key].format && properties[key].format === 'email') {
                            child[key] = properties[key].returnValue;
                        } else if (properties[key].format && properties[key].format !== 'informational-list') {
                            child[key] = [].push(walkObject(properties[key]));
                        } else {
                            // Array of objects, format undefined.
                            child[key] = handleItems(properties[key]);
                        }
                        break;
                    case "object":
                        child[key] = walkObject(properties[key]);
                        break;
                    case "string":
                        if (isInformationalProperty(properties[key].format)) {
                            break;
                        }
                        if (properties[key].returnValue === '') {
                            if (!PROPS.required || PROPS.required.indexOf(key) === -1) {
                                break;
                            }
                        }
                        child[key] = properties[key].returnValue || (properties[key].default || "");
                        break;
                }
            }

            return child;
        };

        var handleOneOf = function (PROPS) {
            var child;
            for (var key in PROPS.oneOf) {
                var radioElementProperties = PROPS.oneOf[key].properties;
                if (radioElementProperties[Object.keys(radioElementProperties)[0]].selectedElement) {
                    child = buildObject(PROPS.oneOf[key]);
                }
            }
            return child;
        };

        var handleSelectTable = function (PROPS) {
            var child = [];
            if (PROPS.items && PROPS.items.required && PROPS.returnValue) {
                child = PROPS.returnValue;
            }

            return child;
        };

        var handleItems = function (PROPS) {
            var child = [];
            if (PROPS.default && PROPS.items) {
                var defaultList = PROPS.default;
                var itemProperties = PROPS.items;
                for (var i = 0; i < defaultList.length; i++) {
                    var nDefault = defaultList[i];
                    //Mix n-Object with its properties
                    var nItemProperties = mergeDefaultWithProperties(nDefault, itemProperties);
                    var data = walkObject(nItemProperties);
                    var pk = primaryKey(nItemProperties);
                    var fixedData = fixDataSelectionProperties(i, data, pk);
                    child.push(fixedData);
                }
            }

            return child;
        };

        var mergeDefaultWithProperties = function (nDefault, PROPS) {
            var properties = PROPS.properties;
            for (var key in properties) {
                properties[key].default = nDefault[key];
            }

            return PROPS;
        };

        var primaryKey = function (PROPS) {
            var properties = PROPS.properties;
            for (var key in properties) {
                if (properties[key].items && properties[key].items.required && properties[key].items.required.length > 0) {
                    return properties[key].items.required[0];
                }
            }
        };

        var fixDataSelectionProperties = function (index, data, pk) {
            for (var key in data) {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    if (pk) {
                        data[key] = [data[key][index]];
                    }
                }
            }

            return data;
        };

        return walkObject(schema);
    }

    return {
        walkSchema: walkSchema
    };
});
