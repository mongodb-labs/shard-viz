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
      $("#leftMargin").addClass("span6");
      $("#rightMargin").addClass("span6");
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind("router:clean" , this.destroy , this);
      this.collectionsView = new CollectionsView({ el : $("#leftMargin") , 
                                                   model : this.model , 
                                                   eventAgg : options.eventAgg , 
                                                   parent : false , 
                                                   slider : false });
      this.shardsView = new ShardsView({ el : $("#rightMargin") , 
                                         model : this.model , 
                                         eventAgg : options.eventAgg , 
                                         parent : false , 
                                         slider : false  });
    } ,
    render : function(){
      this.collectionsView.render();
      this.shardsView.render();
    } ,
    destroy : function(){
      this.eventAgg.unbind("router:clean", this.destroy);
      $("#leftMargin").removeClass("span6");
      $("#rightMargin").removeClass("span6");
    }
  });

  return DashboardView;  

});