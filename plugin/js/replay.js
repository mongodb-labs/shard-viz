// replay.js

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
  "underscore",
  "util"
], function( _ ){

  var Replay = function(){

    //Private methods

    function guidGenerator() {
      var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function genChunkKey( ns , min ){
      return clean(JSON.stringify(ns)) + "|" + clean(JSON.stringify(min));
    }

    function rewind( collections , shards , chunks , changeLogData , databases , startIdx , endIdx ){
      var shardMap = {};
      var collMap = {};
      var data = changeLogData;
      var idx = startIdx;
      while( idx > endIdx ){
        collMap[data[idx].ns] = data[idx].ns;
        switch(data[idx].what){
        case "split" : {

          var leftData =  chunks[ genChunkKey( data[idx].ns , data[idx].details.left.min ) ];
              rightData = chunks[ genChunkKey( data[idx].ns , data[idx].details.right.min ) ];

          var _id = leftData.ns + "-_id_" + guidGenerator() ,
              lastmod = { t : data[idx].details.before.lastmod.t , 
                          i : data[idx].details.before.lastmod.i } ,
              ns = data[idx].ns ,
              min = leftData.min ,
              max = rightData.max ,  
              shard = leftData.shard;
  
          var origData = { _id : _id , 
                           lastmod : lastmod , 
                           ns : ns , 
                           min : min , 
                           max : max , 
                           shard : shard };
    
          //Remove post-split chunks from chunk map.
          delete chunks[ genChunkKey( data[idx].ns , data[idx].details.left.min ) ];
          delete chunks[ genChunkKey( data[idx].ns , data[idx].details.right.min ) ];
  
          if( clean(JSON.stringify(origData.min)) == '{"_id":{"$minKey":1}}' &&
              clean(JSON.stringify(origData.max)) == '{"_id":{"$maxKey":1}}' ){
            if(typeof collMap[data[idx].ns] != "undefined" ){
              delete collMap[data[idx].ns];
            }

            idx--;
            continue; // If this is the initial chunk for the collection, don't insert back into chunks
          }

          //Insert pre-split chunk into chunk map.
          chunks[ genChunkKey( data[idx].ns , leftData.min ) ] = origData;

        }
        break;
        case "moveChunk.commit" : { 
          if(typeof chunks[genChunkKey(data[idx].ns , data[idx].details.min)] == "undefined" )
            console.log(data[idx]);
          chunks[ genChunkKey( data[idx].ns , data[idx].details.min ) ].shard = data[idx].details.from;
        }
        break;
        case "moveChunk.from" : {
          // if( typeof data[idx].details.note != "undefined" && data[idx].details.note == "aborted" )
          //   console.log("---> Aborted migration detected.");
        }
        break;
        case "dropCollection" : {
          //console.log("---> Dropped collection detected.");
        }
        break;
        case "dropDatabase" : {
          //console.log("---> Dropped db detected.");
        }
        }
        idx--;
      }

      collections = updateCollections( changeLogData , collections , startIdx , endIdx );
      updateChunks( changeLogData , chunks , collections , startIdx , endIdx );

      var data = { collections : collections , shards : shards , chunks : chunks };

      return data;
    }

    function fastForward( collections , shards , chunks , changeLogData , databases , startIdx , endIdx ){
      var collMap = {};
      var shardMap = {};
      var data = changeLogData;
      var idx = startIdx;
      while ( idx <= endIdx ){
        collMap[data[idx].ns] = { _id : data[idx].ns , dropped : false };
        switch(data[idx].what){
        case "split" : {
          var oldChunk = chunks[ genChunkKey( data[idx].ns , data[idx].details.before.min ) ];

          if( typeof oldChunk == "undefined"){
            var shard;

            _.each(databases , function(db){
              if( db._id == data[idx].ns.split(".")[0] ){
                shard = db.primary;
              }
            })

            var chunk = { _id : data[idx].ns + "-_id_" + guidGenerator() , 
                          lastmod : data[idx].details.before.lastmod ,
                          ns : data[idx].ns ,
                          min : data[idx].details.before.min , 
                          max : data[idx].details.before.max ,
                          shard : shard };
            chunks[genChunkKey( data[idx].ns , data[idx].details.before.min )] = oldChunk = chunk;
          }
          
          var shard = oldChunk.shard;
          var leftChunk = { _id : data[idx].ns + "-_id_" + guidGenerator() , 
                            lastmod : data[idx].details.left.lastmod , 
                            ns : data[idx].ns , 
                            min : data[idx].details.left.min ,
                            max : data[idx].details.left.max , 
                            shard : shard
                          };
          var rightChunk = { _id : data[idx].ns + "-_id_" + guidGenerator() ,
                             lastmod : data[idx].details.right.lastmod , 
                             ns : data[idx].ns , 
                             min : data[idx].details.right.min ,
                             max : data[idx].details.right.max ,
                             shard : shard
                           };
          // Remove pre-split chunk from chunk map.
          delete chunks[ genChunkKey( data[idx].ns , data[idx].details.before.min ) ];
          // Insert post-split chunks into chunk map.
          chunks[ genChunkKey( leftChunk.ns , leftChunk.min ) ] = leftChunk;
          chunks[ genChunkKey( rightChunk.ns , rightChunk.min ) ] = rightChunk;
          // console.log("---> Split.");
        }
        break;
        case "moveChunk.commit" : {  
          var shardId = chunks[genChunkKey( data[idx].ns , data[idx].details.min )].shard;
          if( typeof shardId == "undefined" )
            chunks[genChunkKey( data[idx].ns , data[idx].details.min )].shard = shardId = data[idx].details.from;
          shardMap[shardId] = {_id : shardId};
          shardId = data[idx].details.from;
          shardMap[shardId] = {_id : shardId};
          chunks[ genChunkKey( data[idx].ns , data[idx].details.min ) ].shard = data[idx].details.to;
          // console.log("---> Migration.");
        }
        break;
        case "moveChunk.from" : {
          // if( typeof data[idx].details.note != "undefined")
          //   console.log("---> Aborted migration detected."); 
        }
        break;
        case "dropCollection" : { 
          // console.log("---> Dropped collection detected.");
        }
        break;
        case "dropDatabase" : {
          // console.log("---> Dropped db detected.");
        }
        }
        idx++;
      }


      collections = _.uniq(_.union( _.values(collMap) , collections ) , false , function(item){ return item._id });
      shards = _.uniq( _.union( _.values(shardMap) , shards ) , false , function(item){ return item._id });
      var data = { collections : collections , shards : shards , chunks : chunks };

      return data;
    }

    function replay( collections , shards , chunks , changeLog , databases , startDate , destDate ){

      var collections = _.map(collections , function(coll){ return new clone(coll); })
      var shards = _.map(shards , function(shard){ return new clone(shard); });
      var chunkMap = {};
      _.each(chunks , function(chunk){chunkMap[genChunkKey( chunk.ns , chunk.min )] = new clone(chunk); })
      var chunks = chunkMap;


      var timestamps = _.map(changeLog , function(entry){ return entry.time.$date; });
      var startIdx = _.sortedIndex(timestamps , startDate );
      var endIdx = _.sortedIndex(timestamps , destDate );

      if(startIdx == changeLog.length){
        startIdx -= 1;
      }

      if(endIdx == changeLog.length){
        endIdx -= 1;
      }

      var direction = endIdx - startIdx > 0 ? "forward" : "rewind"; 

      if( endIdx == startIdx ){
        return;
      }

      if(direction == "forward") return fastForward( collections , shards , chunks , changeLog , databases , startIdx , endIdx );
      if(direction == "rewind")  return rewind( collections, shards , chunks , changeLog , databases , startIdx , endIdx ); 

    }

    function updateCollections( changeLog , collections , startIdx , endIdx ){
      var direction = endIdx - startIdx > 0 ? "forward" : "rewind" ; 
      var nsArr = _.pluck( changeLog , "ns" );
      var finalCollections = [];
      _.each(collections , function(coll){
        if(direction == "rewind" ){
          var initCollIdx = _.indexOf( nsArr , coll._id );
          if( initCollIdx != -1 && initCollIdx <= endIdx){
            finalCollections.push(coll);
          }
        } else {
          var initCollIdx = _.indexOf( nsArr , coll._id );
          console.log(initCollIdx);
          if( initCollIdx != -1 && initCollIdx < endIdx){
            finalCollections.push(coll);
          }
        }
      });
      return finalCollections;
    }

    function updateShards( changeLog , shards , startIdx , endIdx ){ // Not fully accurate. Relies on changelog migration entry
      var finalShards = [];
      _.each(shards , function(shard){
        for(var i = 0; i < changeLog.length ; i++){
          var entry = changeLog[i];
          if(entry.what == "moveChunk.commit"){
            if( entry.details.from == shard._id || entry.details.to == shard._id ){
              if(i <= endIdx){
                finalShards.push(shard);
                break;
              }
            }
          }          
        }
      });

      return finalShards;
    }

    function updateChunks( changeLog , chunks , collections , startIdx , endIdx ){
      var collMap = {};
      _.each(collections , function(coll){
        collMap[coll._id] = coll;
      })

      _.each(chunks , function(chunk){
        if(typeof collMap[chunk.ns] == "undefined"){
          delete chunk; 
        }
      })
    } 

    // Public methods
    return {
      replay : replay ,
      genChunkKey : genChunkKey
    }  
  }

  return Replay();

});