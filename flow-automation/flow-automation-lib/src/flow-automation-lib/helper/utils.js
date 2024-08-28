define(['i18n/AdvancedDateTime'], function (DateTime) {

        var urlPattern = /(\b(https?|http):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

        return {

            COLON: ": ",

            HYPHEN: " - ",

            EMPTY: "",

            getURLSearchParams: function () {
                var hrefSearch = location.hash.split("?");
                if (hrefSearch.length > 1) {
                    return new URLSearchParams(location.hash.split("?")[1]);
                } else {
                    return new URLSearchParams("");
                }
            },

            setURLParams: function (param, value) {

                var hrefSearch = location.hash.split("?");
                var searchParams = new URLSearchParams(hrefSearch[1]);

                if (value) {
                    searchParams.set(param, value);
                } else {
                    searchParams.delete(param);
                }
                var mountUrl = "/" + hrefSearch[0] + (searchParams.toString() ? "?" + searchParams.toString() : "");
                history.replaceState("", "", mountUrl);
            },

            isEmpty: function (obj) {
                if (obj.length === 0) return true;
                for (var key in obj) {
                    if (obj.hasOwnProperty(key) && Object.keys(obj[key]).length !== 0)
                        return false;
                }
                return true;
            },

            isBlank: function (str) {
                return (!str || /^\s*$/.test(str));
            },

            concatIfExist: function (base, text, separator) {
                if (!separator) {
                    separator = this.HYPHEN;
                }
                return base + (this.isBlank(text) ? this.EMPTY : separator + text);
            },

            /**
             * Method responsibly to extract every link inside the param received and convert it into the clickable link
             * @param text which with contains links
             * @returns {*} text with tags <a>
             */
            convertLinkIntoClickableLink: function (text) {
                if (!text) {
                    return this.EMPTY;
                }
                try {
                    return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
                } catch (ignored) {
                }
                return text;
            },

            /**
             *  DATE TRANSFORMATION METHODS
             *  @return a dateTime
             *  @param dateInMilliseconds
             */
            convertDate: function (dateInMilliseconds) {
                return new DateTime(new Date(dateInMilliseconds)).mode('international').format('DTS');
            }
        };
    }
);