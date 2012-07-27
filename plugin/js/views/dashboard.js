// home.js

define([
  "jquery",
  "underscore",
  "backbone",
  "views/collections",
  "views/shards"
], function( $, _ , Backbone , CollectionsView , ShardsView ){

  var DashboardView = Backbone.View.extend({

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind("router:clean" , this.destroy , this);
      $("#leftMargin").addClass("span6");
      $("#rightMargin").addClass("span6");
      this.collectionsView = new CollectionsView({ el : $("#leftMargin") , model : this.model , eventAgg : options.eventAgg });
      this.shardsView = new ShardsView({ el : $("#rightMargin") , model : this.model , eventAgg : options.eventAgg });
    } ,
    destroy : function(){
      this.unbind();
      $("#leftMargin").removeClass("span6");
      $("#leftMargin").removeClass("span6");
    }
  });

  return DashboardView;  

});