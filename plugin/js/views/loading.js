// loading.js

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

define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-modal"
], function( $ , _ , Backbone ){

  var LoadingView = Backbone.View.extend({

    template : $("#loading-tmpl").html() ,

    initialize : function(){
      $(this.el).html(this.template);
      $("#loadingModal").modal({ keyboard : false , backdrop : "static" });
      this.model.bind( "configdata:loaded" , this.closeModal , this );
      return this;
    } ,
    closeModal : function(){
      $("#loadingModal").modal("hide"); 
    }
  });

  return LoadingView;  

});