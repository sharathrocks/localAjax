/**
 * Created by sharath on 07/03/15.
 * This library intercepts ajax calls, creates a fake xhr object and calls the jquery onreadystatechange handler after modifying the response.
 * The xhr-overriding logic used in this library is inspired from the jQuery mockjax plugin which is a Ajax mock plugin used for testing applications when the backend is not fully ready.
 */

(function($){
    var jQAjax = $.ajax;
    var mockAjaxCallsList = {};
    window.console = window.console || {
        log: function(){},
        error: function(){},
        debug: function(){}
    };
    // Process the xhr objects send operation
    function processXhr(mockHandler) {

        function finalizeAndMakeCall() {
            this.readyState	= 4;

            var onReady;
            // Set the response on the xhr object to the mock response.
            this.responseText = JSON.stringify(mockHandler.response);
            this.status = '200'; // Hard code 200 for all responses for the time being till we can get it from the request config.
            this.statusText = 'OK'; // Hardcode response text for the time being till we can get it from the request config.

            // jQuery 2.0 renamed onreadystatechange to onload
            onReady = this.onreadystatechange || this.onload;
            onReady();
        }
        var process = $.proxy(finalizeAndMakeCall, this);
        process();
    }

    // Construct a mocked XHR Object
    function xhr(mockHandler, requestSettings) {
        mockHandler = $.extend(true, {}, $.localAjax.settings, mockHandler);
        requestSettings.headers = requestSettings.headers || {};
        mockHandler.headers = mockHandler.headers || {};
        // Return a custom jqxhr object which is a superset of the native xhr.
        return {
            status: mockHandler.status,
            statusText: mockHandler.statusText,
            readyState: 1,
            open: function() { },
            send: function() {
                // Have a custom send function which will fake the response.
                processXhr.call(this, mockHandler);
            },
            abort: function() { },
            setRequestHeader: function(header, value) {
                requestSettings.headers[header] = value;
            },
            getResponseHeader: function(header) {
                // 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
                if ( mockHandler.headers && mockHandler.headers[header] ) {
                    // Return arbitrary headers
                    return mockHandler.headers[header];
                } else if ( header.toLowerCase() == 'last-modified' ) {
                    return mockHandler.lastModified || (new Date()).toString();
                } else if ( header.toLowerCase() == 'etag' ) {
                    return mockHandler.etag || '';
                } else if ( header.toLowerCase() == 'content-type' ) {
                    return mockHandler.contentType || 'text/plain';
                }
            },
            getAllResponseHeaders: function() {
                var headers = '';
                if (mockHandler.contentType) {
                    mockHandler.headers['Content-Type'] = mockHandler.contentType;
                }
                if(mockHandler.headers) {
                    $.each(mockHandler.headers, function(k, v) {
                        headers += k + ': ' + v + "\n";
                    });
                }
                return headers;
            }
        };
    }
    function getMockResponseForCurrentRequest(mockHandler) {
        return mockHandler;
    }
    function createMockRequest(mockHandler, requestSettings, origSettings) {
        var mockRequest = jQAjax.call($, $.extend(true, {}, origSettings, {
            // Mock the XHR object
            xhr: function() {
                return xhr( mockHandler, requestSettings);
            }
        }));
        return mockRequest;
    }
    function ajaxInterceptor(url, ajaxOptions) {
        var mockRequest;
        // There are 2 ways to make an ajax call in jQuery.
        // $.ajax(url[,options]) and $.ajax(options)
        // If url is an object, then assume second format of call.
        // To normalize the calls, change all calls to format #2
        if (typeof url === "object") {
            ajaxOptions = url;
        } else {
            ajaxOptions = ajaxOptions || {};
            $.extend(ajaxOptions, {url: url});
        }

        // Fire a regular ajax call for calls when we're not in mock mode
        if(true ===$.localAjax.settings.mockMode || true === ajaxOptions.mockMode) {
            // If either the global setting for mock is true or if the local ajax call flag for mockmode is true, fake the request
            console.log("Intercepted call - route: "+ajaxOptions.url);
            var reqSettings = $.extend({}, $.ajaxSettings, ajaxOptions);
            var requestType = ajaxOptions.type || $.ajaxSettings.type;
            var normalisedDestinationUrl = requestType.toLowerCase()+':'+ajaxOptions.url;
            if(normalisedDestinationUrl in mockAjaxCallsList) {
                // We have a mock response for the current request, get it.
                var mockResponse = getMockResponseForCurrentRequest(mockAjaxCallsList[normalisedDestinationUrl]);
                // create and return a mock jQXHR object which is returned when a regular ajax call is made from jQuery.
                mockRequest = createMockRequest({response:mockResponse}, reqSettings, ajaxOptions, mockResponse);
                return mockRequest;
            } else {
                throw new Error("No mock route found for URL "+ajaxOptions.url);
            }
        } else {
            console.log("Pass through call");
            return jQAjax.apply($, [ajaxOptions]);
        }
    }
    // Extend jQuery Object to intercept all AJAX calls.
    $.extend($, {ajax: ajaxInterceptor});

    // localAjax API on jQuery.
    // Takes in a settings object and adds the keys(url for mock) and the corresponding responses to the internal list of mock url's
    $.localAjax = function(settings) {
        $.extend(mockAjaxCallsList, settings);
    };

    // Settings object for the plugin.
    $.localAjax.settings = {
        mockMode: false
    };

    // Remove all mocks and reset to initial state.
    $.localAjax.reset = function() {
        mockAjaxCallsList = {};
    };

    // Remove mocks present as part of settings object, keeping the other mocks intact.
    $.localAjax.removeMock = function(settings) {
        for(var i in settings) {
            if(i in mockAjaxCallsList && settings.hasOwnProperty(i)) {
                delete mockAjaxCallsList[i];
            }
        }
    }

})(jQuery);