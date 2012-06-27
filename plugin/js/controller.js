var Controller = (function(){

	// Private variables

	var source; 
	var dbData;
	var replayData;
	var colls;


	// Private methods

	// Collections view logic

	function formatCollectionsData( collections , shards , chunks ){
		var data = {};
  	data.name = "root";
  	data.children = [];

  	// Count chunks and shards for each collection
  	for (var i in collections) {
  	  if (collections[i].dropped) continue; //skip dropped collections
	
  	  var child = {};
  	  child.name = collections[i]._id;
  	  child.shards = [];
  	  child.size = 0;
  	  
  	  // Count chunks
  	  for (var j in chunks) {
  	    if (child.name == chunks[j].ns) {
  	      child.size++;
  	    }
  	  }
	
  	  // Group a collection's shards and chunks
  	  for (var k in shards) {
  	    shards[k].chunks = [];
  	    for (var l in chunks) {
  	      if (shards[k]._id == chunks[l].shard && chunks[l].ns == child.name) {
  	         shards[k].chunks.push(chunks[l]);
  	      }
  	    }
  	    if (shards[k].chunks.length > 0) {
  	      child.shards.push(new clone(shards[k]));
  	    }
  	  }
  	  data.children.push(child);
  	}
  	return data;
	}

	function drawCollections( data ){
		var formattedData;
		if( source == "db" ) formattedData = formatCollectionsData(dbData.collections, dbData.shards, dbData.chunks);
		if( source == "replay") formattedData = formatCollectionsData(replaydata);
		colls( formattedData );
	}

	function init( cntr ){
		if( typeof container == "undefined" ) return;
		container = cntr;
		source = "db" ;
		colls = collections( container );
	}


	function setSource( src ){
		if( typeof source == "undefined" || typeof source != "string" ) return;
		if( source != "db" && source != "replay" ) return;
		source = src;
	}

	function setData( data ){
		if( typeof data == "undefined" ) return;
		if( source == "db" ) dbData = data;
		if( source == "replay" ) replayData = data; 
	}

	function processData( mode ){
		if( typeof mode == "undefined" || typeof mode != "string" ) return;
		switch(mode) {
			case "collections" : {
				drawCollections();
			}
			case "shards" : {

			}
		}
	}

	// Public methods

	return {
		init : init,
		setData : setData,
		processData : processData
	}

})();





















