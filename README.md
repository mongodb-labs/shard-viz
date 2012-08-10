#MongoDB Sharding Visualizer#

This is an extension for Google Chrome that allows interactive monitoring of a MongoDB sharded cluster. Additionally it has the capability of displaying previous states of a sharded cluster.

##Dependencies##
* Google Chrome

##Installation##
1. Download and unzip the source.
2. In Google Chrome, go to Preferences > Extensions, enable developer mode, and click "Load unpacked extension...". When prompted, select the plugin directory.
3. In your sharded cluster, ensure that your config server(s) is running with the MongoDB REST interface. For more information, refer to the official MongoDB documentation [here](http://www.mongodb.org/display/DOCS/Http+Interface/).

##Built With##
Backbone.js, d3.js, Require.js, Twitter Bootstrap

##License##
Apache License, Version 2.0