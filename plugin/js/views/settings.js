// settings.js

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
], function( $ , _ , Backbone ) {
  
  var SettingsView = Backbone.View.extend({ 
    template : $("#settings-tmpl").html(),
    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.content = options.content;
      _.bindAll(this, "render");
      $("#settingsModal").modal();
      return this;
    } ,
    events : {
      "click #settings" : "render",
      "click #applySettings" : "apply",
      "click #cancelSettings" : "destroy",
      "hide" : "destroy"
    } ,
    apply : function(){
      var url = $("#settingsHost").val() + ":" + $("#settingsPort").val();
      persistItem("configUrl" , url);
      this.eventAgg.trigger( "settings:update" , { url : url } );
      this.clickDestroy();
    } ,
    render : function(){
      $(this.content).append(this.template);
      $("#settingsModal").modal("show");

      var self = this;
      $("#settingsForm").validate({
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
          self.apply();
        }
      });

    } , 
    clickDestroy : function(){
      $("#settingsModal").modal("hide");
    } ,
    destroy : function(){
      $("#settingsModal").remove();
    }
  });

  return SettingsView;

});
