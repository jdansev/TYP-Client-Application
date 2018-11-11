


class APIManager {

    private createCORSRequest(method, url) {

        var xhr = new XMLHttpRequest();

        // XHR for Chrome / Firefox / Opera / Safari.
        if ("withCredentials" in xhr) xhr.open(method, url, true);

        // XDomainRequest for IE.
        else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        }
        
        // CORS not supported.
        else xhr = null;
        return xhr;
    }

    // Make the CORS request.
    public makeAPICall(url, callback, callbackobj) {

        var self: any = this;
        var xhr = self.createCORSRequest('GET', url);

        if (!xhr) {
            alert('CORS not supported');
            return;
        }

        // Response handlers
        xhr.onload = function() {
            var json_object_data = $.parseJSON(xhr.responseText);
            if (typeof callback == 'function') {
                callback.apply(callbackobj, [json_object_data]);
            }
        };

        xhr.onerror = function() { alert('Woops, there was an error calling the API.'); };
        xhr.send();

    }
}