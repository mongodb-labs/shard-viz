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
      this.eventAgg.bind( "clean" , this.destroy , this );
      this.slider = TimeSlider( d3.select(this.el) , this.eventAgg );
      //this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.render();
      return this;
    } , 
    render : function(){
      this.slider(this.model.get("changeLog"));
    } , 
    destroy : function(){
      d3.select("#slider-svg").remove();
      this.unbind();
    }
  });

  return TimesliderView;  

});