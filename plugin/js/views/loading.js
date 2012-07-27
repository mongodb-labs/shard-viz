// loading.js

define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-modal"
], function( $ , _ , Backbone ){

  var LoadingView = Backbone.View.extend({

    template : _.template($("#loading-tmpl").html()) ,

    initialize : function(){
      $(this.el).html(this.template());
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