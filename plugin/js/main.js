// main.js

// Copyright 2012 Phillip Quiza, Andrei Nagornyi

/**
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

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