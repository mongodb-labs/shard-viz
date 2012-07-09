$(document).ready(function(){

  Controller.init( d3.select("#drawboard") );
  host = ['127.0.0.1', '5004', '', ''];
  
  update = function () {
    interval = setInterval(function () {
      getCollections(host, function (collections) {
        getShards(host, function (shards) {
          getChunks(host, function (chunks) {
    
	    var dat = formatShardsData(collections.rows, shards.rows, chunks.rows);
            var data = {collections : collections.rows , shards : shards.rows , chunks : chunks.rows };

            Controller.setData( data );
            Controller.processData( "collections" );
    
          });
        });
      });
    }, 2000);
  }

});

// vim: set et sw=2 ts=2;
