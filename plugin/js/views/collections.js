// collections.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "views/timeslider",
  "d3_collections",
  "util"
], function( $ , _ , Backbone , d3 , TimesliderView ){

  var CollectionsView = Backbone.View.extend({
    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "clean" , this.destroy , this);
      this.model.bind( "change" , this.render , this ); // listen for configdata model updates
      this.model.bind( "loaded" , this.render , this);
      this.bind("clearView" , this.destroy , this);
      this.d3CollChart = collections(d3.select(this.el));
      $(this.el).append("<div id=slider></div><button id='in'> Zoom in</button><button id='out'> Zoom out</button>");
      this.slider = new TimesliderView({ el : $("#slider") , model : this.model });
    } ,
    render : function(){
      this.d3CollChart( this.model.toJSON() );
      return this;
    } ,
    destroy : function(){
      d3.select("#collections-svg").remove();
      this.unbind();
    }
  });

  return CollectionsView;  

});