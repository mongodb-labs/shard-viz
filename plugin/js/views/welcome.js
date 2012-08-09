// welcome.js

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
