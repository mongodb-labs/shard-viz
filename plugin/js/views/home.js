// home.js

define([
  "jquery",
  "underscore",
  "backbone"
], function( $, _ , Backbone ){

  var HomeView = Backbone.View.extend({

    initialize : function(){
      console.log("Initializing home view");
    } ,
    render : function(){
      $(this.el).html();
      return this;
    }
  });

  return HomeView;  

});