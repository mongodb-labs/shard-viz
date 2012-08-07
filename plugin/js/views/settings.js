// settings.js

define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-modal",
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
      "click #cancelSettings" : "clickDestroy",
      "hide" : "destroy"
    } ,
    apply : function(){
      var url = "http://" + $("#settingsHost").val() + ":" + $("#settingsPort").val();
      persistItem("configUrl" , url);
      this.eventAgg.trigger( "settings:update" , { url : url } );
      this.clickDestroy();
    } ,
    render : function(){
      $(this.content).append(this.template);
      $("#settingsModal").modal("show");
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
