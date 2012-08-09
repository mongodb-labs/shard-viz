// timeslider.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "d3_charts/d3_slider"
], function( $ , _ , Backbone , d3 , TimeSlider){

  var TimesliderView = Backbone.View.extend({

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this );
      //this.eventAgg.bind( "router:resize" , this.resize , this );
      $(this.el).append("<i id='in' class='icon-plus-sign'></i><i id='out' class='icon-minus-sign'></i>");
      this.slider = TimeSlider( d3.select(this.el) , this.eventAgg );
      this.model.bind( "configdata:fetch" , this.render, this );
      this.model.bind( "configdata:loaded" , this.render , this );
      return this;
    } ,
    render : function(){
      this.slider(this.model.get("changeLog"));
    } , 
    resize : function(){
      d3.select("#slider-svg").remove();
      this.slider = TimeSlider( d3.select(this.el) , this.eventAgg );
      this.slider(this.model.get("changeLog"));
    } ,
    destroy : function(){
      d3.select("#slider-svg").remove();
      this.eventAgg.unbind("router:clean" , this.destroy );
      this.eventAgg.unbind("router:resize" , this.destroy );
      this.model.unbind( "configdata:fetch" , this.render );
      this.model.unbind( "configdata:loaded" , this.render );
    }
  });

  return TimesliderView;  

});