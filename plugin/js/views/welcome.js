// welcome.js

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
  "bootstrap-modal",
  "validate",
  "util"
], function( $ , _ , Backbone ){

  var WelcomeView = Backbone.View.extend({

    template : $("#welcome-tmpl").html() ,

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      $(this.el).html(this.template);
      $("#welcomeModal").modal({ keyboard : false , backdrop : "static" });

      var self = this;
      $("#initialSettings").validate({
        rules : {
          host : {
            required : true ,
            url : true
          } , 
          port : {
            required : true ,
            number : true
          }
        } ,
        highlight : function(label){
          $(label).closest(".control-group").removeClass("success");
          $(label).closest(".control-group").addClass("error");
        } ,
        success : function(label){
          $(label).closest(".control-group").removeClass("error");
          $(label).closest(".control-group").addClass("success");
        } ,
        submitHandler : function(form){
          console.log(this);
          self.submit();
        }
      });

      return this;
    },
    submit : function(){
      var url = $("#welcomeHost").val() + ":" + $("#welcomePort").val();
      persistItem("configUrl" , url);
      this.eventAgg.trigger( "welcome:update" , { url : url } );
      this.destroy();
    },
    destroy : function(){
      $(".modal-backdrop").remove();
    }
  });

  return WelcomeView;  

});
