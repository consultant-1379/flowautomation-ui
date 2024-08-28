define([
    'i18n!flow-instance-details/dictionary.json'
], function (dictionary) {
    return {
        createValidations: function (validations, parentId) {
            validations.required.forEach(function (it) {
                var id = parentId + "." + it;
                var element = document.getElementById(id);
                if (element) {
                    var elementFile = document.getElementById(id);
                    if (elementFile) {
                        elementFile.setAttribute("required", true);
                    }
                    var elementError = document.getElementById(parentId + '.error');
                    if (elementError) {
                        elementError.innerHTML = dictionary.get("inputs.file.requiredMessage");
                    }
                }
            });
        }
    };
});