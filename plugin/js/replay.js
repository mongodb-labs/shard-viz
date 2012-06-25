// replay.js

var host = ['127.0.0.1', '5004', '', ''];

$("#slider").on( "slidestop", function( event , ui ){

  getChangelog( host , function( changeLog ){
    getChunks( host , function( chunks ){

      chunkMap = _.groupBy( chunks.rows , 
                           function(chunk){ return clean(JSON.stringify(chunk.ns)) + "|" +
                                                   clean(JSON.stringify(chunk.min)); });

      _.each( chunkMap , function(chunk){
        var key = genChunkKey( chunk[0].ns , chunk[0].min );
        chunkMap[key] = chunk[0];
      });

      var configAt = "";
      var destDate = "";

      replay( chunkMap , configAt , changeLog , destDate );

    });
  });

});



var replay = function( chunks , configAt , changeLog , destDate ){

  var startIdx, endIdx; 

  // Find location of origin and destination indices in changelog.
  var key = _.find(changeLog.rows , function(key){ return key.time.$date == configAt; });
  startIdx = changeLog.rows.indexOf(key);

  key = _.find(changeLog.rows , function(key){ return key.time.$date == destDate });
  endIdx = changeLog.rows.indexOf(key)

  // Check if timestamps exist in the changelog.
  if( typeof startIdx == -1 ){
    console.log("The configAt timestamp is not in the changelog.");
    return;
  }
  if( typeof endIdx == -1 ){
    console.log("The destDate timestamp is not in the changelog.");
    return;
  }

  endIdx = +endIdx;
  startIdx = +startIdx;

  var direction = destDate - configAt > 0 ? "forward" : "rewind" ; 
  if(direction == "forward") configFastForward( chunks , changeLog.rows , startIdx , endIdx );
  if(direction == "rewind") configRewind( chunks , changeLog.rows , startIdx , endIdx ); 

}

var configFastForward = function( chunks , changeLog , startIdx , endIdx ){

  var data = changeLog;
  var idx = startIdx;
  while ( idx <= endIdx ){
    switch(data[idx].what){
    case "split" : {
      
      var oldChunk = chunks[ genChunkKey( data[idx].ns , data[idx].details.before.min ) ]
      
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

      console.log("---> Split.");
    }
    break;
    case "moveChunk.commit" : {  

      chunks[ genChunkKey( data[idx].ns , data[idx].details.min ) ].shard = data[idx].details.to;
      console.log("---> Migration.");

    }
    break;
    case "moveChunk.from" : {
      if( typeof data[idx].details.note != "undefined")
        console.log("---> Aborted migration detected."); 
    }
    break;
    case "dropCollection" : {
      console.log("---> Dropped collection detected.");
    }
    break;
    case "dropDatabase" : {
      console.log("---> Dropped db detected.");
    }
    }
    idx++;
  }
}

var configRewind = function ( chunks , changeLogData , startIdx , endIdx ){
  console.log("--> Starting rewind.");
  var data = changeLogData;
  var idx = startIdx;
  while( idx > endIdx ){
    switch(data[idx].what){
    case "split" : {

      //console.log(genChunkKey( data[idx].ns , data[idx].details.left.min ));
      var leftData =  chunks[ genChunkKey( data[idx].ns , data[idx].details.left.min ) ];
          rightData = chunks[ genChunkKey( data[idx].ns , data[idx].details.right.min ) ];

      var _id = leftData.ns + "-_id_" + guidGenerator() ,
          lastmod = { t : data[idx].details.before.lastmod.t , 
                      i : data[idx].details.before.lastmod.i } ,
          ns = data[idx].ns ,
          min = leftData.min ,
          max = rightData.max ,  
          shard = leftData.shard;

console.log(_id);

      var origData = { _id : _id , 
                       lastmod : lastmod , 
                       ns : ns , 
                       min : min , 
                       max : max , 
                       shard :shard };


      //Remove post-split chunks from chunk map.
      delete chunks[ genChunkKey( data[idx].ns , data[idx].details.left.min ) ];
      delete chunks[ genChunkKey( data[idx].ns , data[idx].details.right.min ) ];


      //Insert pre-split chunk into chunk map.

      console.log(leftData);
      console.log(chunks);
      chunks[ genChunkKey( data[idx].ns , leftData.min ) ] = origData;

      console.log("---> Reversed split.");
    }
    break;
    case "moveChunk.commit" : {  
      chunks[ genChunkKey( data[idx].ns , data[idx].details.min ) ].shard = data[idx].details.from;

      console.log("---> Reversed migration.");
    }
    break;
    case "moveChunk.from" : {
      if( typeof data[idx].details.note != "undefined" && data[idx].details.note == "aborted" )
        console.log("---> Aborted migration detected.");
    }
    break;
    case "dropCollection" : {
      console.log("---> Dropped collection detected.");
    }
    break;
    case "dropDatabase" : {
      console.log("---> Dropped db detected.");
    }
    }
    idx--;
  }
}

var genChunkKey = function( ns , min ){
  return clean(JSON.stringify(ns)) + "|" + clean(JSON.stringify(min));
}

function guidGenerator() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}