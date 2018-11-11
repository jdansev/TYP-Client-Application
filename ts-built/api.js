var APIManager = /** @class */ (function () {
    function APIManager() {
    }
    APIManager.prototype.createCORSRequest = function (method, url) {
        var xhr = new XMLHttpRequest();
        // XHR for Chrome / Firefox / Opera / Safari.
        if ("withCredentials" in xhr)
            xhr.open(method, url, true);
        else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        }
        else
            xhr = null;
        return xhr;
    };
    // Make the CORS request.
    APIManager.prototype.makeAPICall = function (url, callback, callbackobj) {
        var self = this;
        var xhr = self.createCORSRequest('GET', url);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }
        // Response handlers
        xhr.onload = function () {
            var json_object_data = $.parseJSON(xhr.responseText);
            if (typeof callback == 'function') {
                callback.apply(callbackobj, [json_object_data]);
            }
        };
        xhr.onerror = function () { alert('Woops, there was an error calling the API.'); };
        xhr.send();
    };
    return APIManager;
}());
