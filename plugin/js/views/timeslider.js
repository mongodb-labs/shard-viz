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
      this.slider = TimeSlider(d3.select(this.el) , this.eventAgg );
      this.model.bind( "change" , this.render , this ); // listen for configdata model updates
      this.model.bind( "loaded" , this.render , this);
      this.render();
      return this;
    } , 
    render : function(){
      this.slider(this.model.get("changeLog"));
    }
  });

  return TimesliderView;  

});