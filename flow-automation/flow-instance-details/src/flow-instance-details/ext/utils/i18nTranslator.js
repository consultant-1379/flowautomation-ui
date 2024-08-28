define([], function () {

    function _translate(schema, i18n) {
        if (_exists(i18n)) {
            if (_exists(schema.name) && _exists(i18n.name)) {
                schema.name = i18n.name;
            }
            if (_exists(schema.description) && _exists(i18n.description)) {
                schema.description = i18n.description;
            }
            if (_exists(schema.title) && _exists(i18n.title)) {
                schema.title = i18n.title;
            }
            if (_exists(schema.default) && _exists(i18n.default)) {
                schema.default = i18n.default;
            }
        }
    }

    function _exists(variable) {
        return variable !== null && variable !== undefined;
    }

    function _containsProperties(keySchemaProperties) {
        return _exists(keySchemaProperties.properties);
    }

    function _containsOneOf(keySchemaProperties) {
        return _exists(keySchemaProperties.oneOf);
    }

    function _containsItems(keySchemaProperties) {
        return _exists(keySchemaProperties.items);
    }

    function _fillInternationalization(schemaProperties, i18n) {
        Object.keys(schemaProperties).forEach(function (key) {

            var keySchemaProperties = schemaProperties[key];
            var keyDictionary = i18n;

            if(_exists(i18n[key])){
                keyDictionary = i18n[key];
                _translate(keySchemaProperties, keyDictionary); // translate the properties
            }

            if (_containsProperties(keySchemaProperties)) {

                _fillInternationalization(keySchemaProperties.properties, keyDictionary); // recursive mode
            } else if (_containsOneOf(keySchemaProperties)) {
                keySchemaProperties.oneOf.forEach(function (one) {
                    _fillInternationalization(one.properties, keyDictionary); // recursive mode
                });

            } else if (_containsItems(keySchemaProperties) && _exists(keyDictionary.items)){
                _translate(keySchemaProperties.items, keyDictionary.items);

                if (_containsProperties(keySchemaProperties.items)) {
                    _fillInternationalization(keySchemaProperties.items.properties, keyDictionary.items); // recursive mode
                }
            }

        });
    }

    return {

        applyDictionary: function (schema, i18n) {

            if(_exists(i18n) && _exists(i18n.dictionary)){

                this.applyDictionaryWithJson(schema, JSON.parse(i18n.dictionary));
            }
            return schema;
        },

        applyDictionaryWithJson: function (schema, dictionary) {

            if(_exists(dictionary)){

                _translate(schema, dictionary);

                if (_containsProperties(schema) && _exists(dictionary)) {

                    _fillInternationalization(schema.properties, dictionary);
                }
            }
            return schema;
        }
    };
});