require(["localAjax"], function(localAjax){

    function regularAjaxExample(){
        // Example 1
        // A regular ajax call using $.ajax - defaults to GET request.
        // Prints {"regularAjaxExample":"success"} in the console
        localAjax.settings.mockMode = true;
        function callRegularAjax() {
            console.log("Making a regular ajax calling using $.ajax");
            var request = $.ajax('/regularAjaxExample', {
                success: function(data){
                    console.log(data);
                },
                error: function(jqxhr, status, error) {
                    console.error(jqxhr, status, error);
                }
            })
        }
        localAjax({'get:/regularAjaxExample': {regularAjaxExample:'success'}});
        callRegularAjax();
    }

    

    function jqGetExample(){
        // Example 2
        // A $.get call
        // Prints [{a:1}, {jQGetExample:'success'}] in the console
        function callJQGet() {
            console.log("Making an ajax calling using $.get");
            var request = $.get('/jQGetExample').done(function(data){
                console.log(data);
            }).fail(function(jqxhr, status, error) {
                console.error(jqxhr, status, error);
            });
        }
        localAjax({'get:/jQGetExample': [{a:1}, {jQGetExample:'success'}]});
        callJQGet();
    }



    function jqPostExample(){
        // Example 3
        // A $.post call
        // Prints {"a":"1"} in the console
        function callJQPost() {
            console.log("Making an ajax calling using $.post");
            var request = $.post('/jQPostExample').done(function(data){
                console.log(data);
            }).fail(function(jqxhr, status, error) {
                console.error(jqxhr, status, error);
            });
        }
        localAjax({'post:/jQPostExample': [{b:'dummyData'}, {jQPostExample:'success'}]});
        callJQPost();
    }


    function noRouteRegisteredErrorExample(){
        // Example 4
        // A $.post call without the route being registered.
        // This results in a JS error being thrown which states that there is no mock route for the specified URL and the library is currently in mock mode.
        function callJQPostError() {
            try {
                console.log("Making an ajax calling using $.post when there is no route registered. Will result in an exception");
                var request = $.post('/jQPostErrorExample').done(function(data){
                    console.log(data);
                }).fail(function(jqxhr, status, error) {
                    console.error(jqxhr, status, error);
                });
            } catch (ex) {
                console.error("Caught an exception "+ex);
            }
        }
        // No route registration for '/jQPostErrorExample'. This should throw an error.
        callJQPostError();
    }


    function mockRouteWithinConfigExample(){
        // Example 4
        // A $.post call without the route being registered.
        // This results in a JS error being thrown which states that there is no mock route for the specified URL and the library is currently in mock mode.

        // Example config from file
        // This variable can be initialised from a mock config file present on the server and loaded into the library.
        var mockRoutes = {
            "get:/users/1" : {id: 1, name: "foo"},
            "get:/users" : [{id: 1, name: "foo"}, {id: 2, name: "bar"}]
        };

        localAjax(mockRoutes);

        function getDataFromConfigExample() {
            console.log("Making an ajax calling using preloaded config data to the mock.");
            $.get('/users/1').done(function(data){
                console.log(data);
            }).fail(function(jqxhr, status, error) {
                console.error(jqxhr, status, error);
            });

            $.get('/users').done(function(data){
                console.log(data);
            }).fail(function(jqxhr, status, error) {
                console.error(jqxhr, status, error);
            });
        }
        getDataFromConfigExample();
    }


    // Call all the functions
    regularAjaxExample();
    jqGetExample();
    jqPostExample();
    noRouteRegisteredErrorExample();
    mockRouteWithinConfigExample();
});