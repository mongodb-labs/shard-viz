// router.js

define([
  "jquery",
  "underscore",
  "backbone",
  "models/configdata",
  "views/header",
  "views/loading",
  "views/dashboard",
  "views/collections",
  "views/shards"
], function( $ , _ , Backbone , ConfigData , HeaderView , LoadingView , DashboardView , CollectionsView , ShardsView ){
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      "" : "dashboard",
      "collections": "collections",
      "shards" : "shards",
      "settings" : "settings"
    },
    initialize : function(){
      this.eventAgg = _.extend({} , Backbone.Events); // Global event aggregator
      this.configData = new ConfigData({ eventAgg : this.eventAgg }); // Data model
      this.headerView = new HeaderView({ el : $(".header") });
      this.loadingView = new LoadingView({ el : $("#content") , model : this.configData });
    },

    dashboard : function(){
      this.eventAgg.trigger("router:clean");
      this.dashboardView = new DashboardView({ el : $("#content") , model : this.configData , eventAgg : this.eventAgg });
      this.headerView.select("dashboard-menu");
    },
    collections : function(){
      this.eventAgg.trigger("router:clean");
      this.collectionsView = new CollectionsView({ el : $("#content") , model : this.configData , eventAgg : this.eventAgg });
      if(this.configData.initLoad){
        this.collectionsView.render();
      }
      this.headerView.select("collections-menu");
    },
    shards : function(){
      this.eventAgg.trigger("router:clean");
      this.shardsView = new ShardsView({ el : $("#content") , model : this.configData , eventAgg : this.eventAgg })
      if(this.configData.initLoad){
        this.shardsView.render();
      }
      this.headerView.select("shards-menu");
    }
  });

  var initRouter = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };

  return { 
    initialize: initRouter
  };

});