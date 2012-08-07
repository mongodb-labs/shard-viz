// welcome.js

define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-modal",
  "util"
], function( $ , _ , Backbone ){

  var WelcomeView = Backbone.View.extend({

    template : $("#welcome-tmpl").html() ,

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      $(this.el).html(this.template);
      $("#welcomeModal").modal({ keyboard : false , backdrop : "static" });
      return this;
    },
    events : {
      "click #welcomeApplySettings" : "apply"
    },
    apply : function(){
      var url = "http://" + $("#welcomeHost").val() + ":" + $("#welcomePort").val();
      persistItem("configUrl" , url);
      this.eventAgg.trigger( "welcome:update" , { url : url } );
      this.destroy();
    },
    destroy : function(){
      $("#welcomeModal").modal("hide");
    }
  });

  return WelcomeView;  

});
