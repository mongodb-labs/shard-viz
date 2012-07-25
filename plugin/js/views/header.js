// header.js

define([
  "jquery",
  "underscore",
  "backbone"
], function( $, _ , Backbone ){

  var HeaderView = Backbone.View.extend({

    template : _.template($("#header-tmpl").html()) ,

    initialize : function(){
      $(this.el).html(this.template());
      return this;
    } , 

    select: function( menuItem ){
      $('.nav li').removeClass('active');
      $('.' + menuItem).addClass('active');
    }

  });

  return HeaderView;  

});