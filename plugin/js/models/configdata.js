// configdata.js

// Copyright 2012 Phillip Quiza, Andrei Nagornyi

/**
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

define([
  "jquery",
  "underscore",
  "backbone",
  "async",
  "replay",
  "util",
], function( $ , _ , Backbone , async , Replay ) {
  var ConfigData = Backbone.Model.extend({
    defaults: {
      chunks : {},
      shards : [],
      collections : [],
      changeLog : [],
      databases : {}
    },
    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind("timeslider:move" , this.replay , this);
      this.eventAgg.bind("timeslider:stop_fetch" , this.stopFetch , this);
      this.eventAgg.bind("timeslider:resume_fetch" , this.resumeFetch , this);
      this.eventAgg.bind("welcome:update" , this.setInitialUrl, this);
      this.eventAgg.bind("settings:update" , this.changeUrl , this);

      var urlFromLocalStorage = getPersistedItem("configUrl");
      if(urlFromLocalStorage){
        this.url = urlFromLocalStorage;
        this.fetch();
      } else {
        this.url = "";
      }
    } ,
    parse : function(response){

      if( response.changeLog.length != this.attributes.changeLog.length ||
          response.chunks.length != _.values(this.attributes.chunks).length ||
          response.shards.length != this.attributes.shards.length ||
          response.collections.length != this.attributes.collections.length ){

        var chunkMap = {};
        _.each( response.chunks , function(chunk){
          chunkMap[ genChunkKey( chunk.ns , chunk.min ) ] = chunk;
        });
        response.chunks = chunkMap;

        var dbMap = {};
        _.each( response.databases , function(db){
          dbMap[db._id] = db;
        })
        response.databases = dbMap;

        return response;

      } else return;

    },
    fetch : function(){
      var self = this;

      var response = {};

      var urls = { chunks : this.url + "/config/chunks/?limit=0",
                   shards : this.url + "/config/shards/" ,
                   collections : this.url + "/config/collections/" ,
                   changeLog : this.url + "/config/changelog/?limit=0" ,
                   databases : this.url + "/config/databases/" };

      var syncSuccess = function( attr , response , cb ){ 
        this[attr] = response.rows;
        cb();
      }

      var syncError = function( cb ){
        cb();
      }

      var iter = function( item , cb ){ 
        Backbone.sync( "read" , 
                       self , 
                       { url : urls[item] , 
                         success : function(resp){ response[item] = resp.rows; cb(); } ,
                         error : function(){ cb(); } } ) }; 

      async.forEach( _.keys(urls) , iter , function(err){ 
        if(!err){ 

          _.each(response , function(respItem){
            if( typeof respItem == "undefined" ){
              return;
            }
          });

          var parsedResponse = self.parse(response);

          if(!self.fetchTimerId){
            self.attributes = parsedResponse;
            self.initLoad = true;
            self.trigger( "configdata:loaded" );
            self.fetchTimerId = setInterval( function(){ self.fetch({url : self.url + "/config/changelog/?limit=0" }); } , 500 , self);
          } else if( parsedResponse ){
            self.attributes = parsedResponse;
            self.trigger( "configdata:fetch" );
          }
        } 
      }); 
    } ,
    // updateAttributes : function( changeLogDelta ){
    //   var self = this;
    //   _.each( changeLogDelta , function( entry ){
    //     if( typeof self.attributes.collections[entry.ns] == "undefined" ){
    //       self.attributes.collections[entry.ns] = { _id : entry.ns , 
    //                                                 dropped : 
    //                                                 false , 
    //                                                 lastmod : entry.time };
    //     }
    //     switch( entry.what ){
    //       case "split" : {
    //         var oldChunk = self.attributes.chunks[ genChunkKey( entry.ns , entry.details.before.min ) ];
    //         if( typeof oldChunk == "undefined" ){
    //           console.log(entry);
    //           var chunk = { _id : entry.ns + "_id" + guidGenerator() ,
    //                         lastmod : entry.details.before.lastmod ,
    //                         ns : entry.ns ,
    //                         min : entry.details.before.min ,
    //                         max : entry.details.before.max };

    //           self.attributes.chunks[ genChunkKey( entry.ns , entry.details.before.min ) ] = chunk;
    //           oldChunk = chunk;
    //         }
    //         var shard = oldChunk.shard;
    //         // Remove old chunk
    //         delete oldChunk;
    //         // Generate new chunks
    //         var leftChunk = { _id : entry.ns + "-_id_" + guidGenerator() , 
    //                           lastmod : entry.details.left.lastmod , 
    //                           ns : entry.ns , 
    //                           min : entry.details.left.min ,
    //                           max : entry.details.left.max , 
    //                           shard : shard
    //                         };
    //         var rightChunk = { _id : entry.ns + "-_id_" + guidGenerator() ,
    //                            lastmod : entry.details.right.lastmod , 
    //                            ns : entry.ns , 
    //                            min : entry.details.right.min ,
    //                            max : entry.details.right.max ,
    //                            shard : shard
    //                          };

    //         self.attributes.chunks[ genChunkKey( entry.ns , leftChunk.min )] = leftChunk;
    //         self.attributes.chunks[ genChunkKey( entry.ns , rightChunk.min )] = rightChunk;
    //       }
    //       break;
    //       case "moveChunk.commit" : {

    //         if( typeof self.attributes.shards[ entry.details.to ] == "undefined" )
    //           self.attributes.shards[ entry.details.to ] = { _id : entry.details.to };
    //         if( typeof self.attributes.shards[ entry.details.from ] == "undefined" )
    //           self.attributes.shards[ entry.details.from ] = { _id : entry.details.from };

    //         self.attributes.chunks[ genChunkKey( entry.ns , entry.details.min )].shard = entry.details.to;
    //       }
    //       break;
    //       case "dropCollection" : {
    //         self.attributes.collections[entry.ns].dropped = true;
    //         //Todo : Remove chunks of dropped collection?
    //       }
    //       break;
    //       case "dropDatabase" : {

    //       }
    //     }
    //   });
    // } ,
    toJSON : function(){
      var attrs = {};
      attrs.chunks = _.values(this.attributes.chunks);
      attrs.shards = this.attributes.shards; //_.values(this.attributes.shards);
      attrs.collections = this.attributes.collections; //_.values(this.attributes.collections);
      return attrs;
    },
    replay : function(time){
      if(!this.prevReplayTime){
        this.prevReplayTime = time.prevTime;
      }
      var replayData = Replay.replay( this.attributes.collections , 
                                      this.attributes.shards , 
                                      this.attributes.chunks , 
                                      this.attributes.changeLog , 
                                      this.attributes.databases ,
                                      this.prevReplayTime ,  
                                      time.curTime );

      this.prevReplayTime = time.curTime;

      if( replayData ){
        this.attributes.chunks = replayData.chunks;
        this.attributes.collections = replayData.collections;
        this.attributes.shards = replayData.shards;
        this.trigger("configdata:replay");
      }

    },
    stopFetch : function(){
      if(this.fetchTimerId){
        clearInterval(this.fetchTimerId);
        this.fetchTimerId = 0;
      }
    } ,
    resumeFetch : function(){
      if(!this.fetchTimerId){
        this.fetchTimerId = setInterval( function(){ self.fetch({url : self.url + "/config/changelog/?limit=0" }); } , 500 , self);
      }
    },
    setInitialUrl : function(newUrl){
      this.url = newUrl.url;
      this.fetch();
    },
    changeUrl : function(newUrl){
      this.url = newUrl.url;
    },
    initLoad : false
    
  });
  return ConfigData;

});