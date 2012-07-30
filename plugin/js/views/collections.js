// collections.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "views/timeslider",
  "views/legend",
  "views/time_module",
  "d3_collections",
  "jqueryui",
  "util"
], function( $ , _ , Backbone , d3 , TimesliderView , LegendView , TimeModuleView , CollectionsChart ){

  var CollectionsView = Backbone.View.extend({
    initialize : function(options){
      if(options.parent){
        this.parent = true;
        $("#leftMargin").addClass("span2");
        $("#rightMargin").addClass("span2");
        $(this.el).addClass("span8");
      }
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.d3CollChart = CollectionsChart(d3.select(this.el));
      if(options.slider){
        $(this.el).append("<div id=slider></div>");
        this.sliderView = new TimesliderView({ el : $("#slider") , model : this.model , eventAgg : options.eventAgg });
        if(this.model.initLoad){
          this.sliderView.render();
        }
      }
      if(options.legend){
        $("#rightMargin").append("<div id=collections-legend></div>");
        $("#collections-legend").append("<h2>" + "Collections" + "</h2>").css("font-family" , "Helvetica Neue, Helvetica, sans-serif")
        $("#rightMargin").append("<div id=shards-legend></div>");
        $("#shards-legend").append("<h2>" + "Shards" + "</h2>").css("font-family" , "Helvetica Neue, Helvetica, sans-serif");
        this.collLegendView = new LegendView({ el : $("#collections-legend") , model : this.model , eventAgg : options.eventAgg , chart : this.d3CollChart , mode : "collections:collections" });
        this.shardLegendView = new LegendView({ el : $("#shards-legend") , model : this.model , eventAgg : options.eventAgg , chart : this.d3CollChart , mode : "collections:shards" });
      }
      if(options.time_module){
        this.timeModuleView = new TimeModuleView({ el : $("leftMargin") , model : this.model , eventAgg : options.eventAgg });
        if(this.model.initLoad){
          this.timeModuleView.render();
        }
      }
    } ,
    render : function(){
      this.d3CollChart( this.model.toJSON() );
      return this;
    } ,
    destroy : function(){
      if(this.parent){
        $("#leftMargin").removeClass("span2");
        $("#rightMargin").removeClass("span2");
        $(this.el).removeClass("span8");
      }
      if(this.collLegendView){
        $("#collections-legend").remove();
      }
      if(this.shardLegendView){
        $("#shards-legend").remove();
      }
      d3.select("#collections-svg").remove();
      this.eventAgg.unbind( "router:clean" , this.destroy);
      this.model.unbind( "configdata:replay" , this.render);
      this.model.unbind( "configdata:fetch" , this.render);
      this.model.unbind( "configdata:loaded" , this.render);
      if(this.sliderView){
        $("#slider").remove();
        $("#in").remove();
        $("#out").remove();
      }
    }
  });

  return CollectionsView;  

});