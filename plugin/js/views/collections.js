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
      this.eventAgg.bind( "router:clean" , this.destroy , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.bind("clearView" , this.destroy , this);
      this.d3CollChart = collections(d3.select(this.el));
      $("#leftMargin").addClass("span2");
      $("#rightMargin").addClass("span2");
      $(this.el).addClass("span8");
      $(this.el).append("<div id=slider><button id='in'> Zoom in</button><button id='out'> Zoom out</button></div>");
      this.slider = new TimesliderView({ el : $("#slider") , model : this.model , eventAgg : options.eventAgg });
    } ,
    render : function(){
      this.d3CollChart( this.model.toJSON() );
      return this;
    } ,
    destroy : function(){
      d3.select("#collections-svg").remove();
      this.unbind();
      $("#slider").remove();
      $("#leftMargin").removeClass("span2");
      $("#rightMargin").removeClass("span2");
      $(this.el).removeClass("span8");
    }
  });

  return CollectionsView;  

});