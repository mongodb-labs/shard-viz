// main.js

require.config({
  paths: {
    jquery: "libs/jquery/jquery.min",
    "bootstrap-popover" : "libs/jquery/bootstrap-popover",
    "bootstrap-tooltip" : "libs/jquery/bootstrap-tooltip",
    "bootstrap-modal" : "libs/jquery/bootstrap-modal",
    validate : "libs/jquery/jquery.validate",
    underscore: "libs/underscore/underscore.min",
    backbone: "libs/backbone/backbone.min",
    async : "libs/async/async.min",
    d3 : "libs/d3/d3.v2.min",
    d3_collections : "d3_charts/d3_collections",
    d3_shards : "d3_charts/d3_shards"
  } ,
  shim : {
    async : {
      exports : "async"
    } ,
    d3 : {
      exports : "d3"
    }
  }

});

require([
  "app"
], function(App){
  App.initialize();
});