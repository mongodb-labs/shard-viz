/* Given an array of collections and chunks
 * returns the collections array with chunks and shards
 * appended to each collection. The number of chunks is 
 * appended ot each shard
 */
function formatData(collections, shards, chunks) {
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

/* Returns a value copy of the given object
 */
function clone(source) {
  for (i in source) {
    if (typeof source[i] == 'source') {
      this[i] = new clone(source[i]);
    }
    else{
      this[i] = source[i];
    }
  }
}

// vim: set et sw=2 ts=2;
