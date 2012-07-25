// router.js

define([
  "jquery",
  "underscore",
  "backbone",
  "models/configdata",
  "views/header",
  "views/loading",
  "views/home",
  "views/collections",
  "views/shards"
], function( $ , _ , Backbone , ConfigData , HeaderView , LoadingView , HomeView , CollectionsView , ShardsView ){
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      "" : "home",
      "collections": "collections",
      "shards" : "shards",
      "settings" : "settings"
    },
    initialize : function(){
      this.eventAgg = _.extend({} , Backbone.Events);
      this.configData = new ConfigData();
      //this.configData.bind( "loaded" , this.setLoaded , this );
      this.headerView = new HeaderView({ el : $(".header") });
      this.loadingView = new LoadingView({ el : $("#content") , model : this.configData });
    },

    home : function(){
      this.eventAgg.trigger("clean");
      if(!this.homeView) {
        this.homeView = new HomeView({ el : $("#content") });
        this.homeView.render();
      } else {
        this.homeView.delegateEvents(); // delegate events when the view is recycled
      }
      this.headerView.select("home-menu");
    },
    collections : function(){
      this.eventAgg.trigger("clean");
      this.collectionsView = new CollectionsView({ el : $("#content") , model : this.configData , eventAgg : this.eventAgg });
      if(this.configData.initLoad){
        this.collectionsView.render();
      }
      this.headerView.select("collections-menu");
    },
    shards : function(){
      this.eventAgg.trigger("clean");
      this.shardsView = new ShardsView({ el : $("#content") , model : this.configData , eventAgg : this.eventAgg })
      if(this.configData.initLoad){
        this.shardsView.render();
      }
      this.headerView.select("shards-menu");
    },
    settings : function(){
      this.headerView.select("settings-menu")
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