#Ajax Mock library
This library intercepts ajax calls, creates a fake xhr object and calls the jquery *onreadystatechange* handler after modifying the response.
The xhr-overriding logic used in this library is inspired from the jQuery mockjax plugin which is a Ajax mock plugin used for testing applications when the backend is not fully ready.

To run:
Please run a http server inside the main project directory and navigate to "host:port/test", open the console and view the result.
Currently, this library does ~~NOT~~ support loading from requirejs/AMD pattern.
~~It is a work in progress.~~

Update: 11th March 2015:
This library now includes AMD compliance and can be loaded through requirejs.

Use 

``` require(["localAjax"], function(localAjax){
// code here
})```

to include the library into any project.
The requirejs examples are present in the folder "requirejs example".
To run, please run a http server in the "requirejs example" directory and check the logs in the console.
"main.js" contains the code that loads the library using requirejs and runs the tests.