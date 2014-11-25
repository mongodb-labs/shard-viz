DISCLAIMER
==========
Please note: all tools/ scripts in this repo are released for use "AS IS" without any warranties of any kind, including, but not limited to their installation, use, or performance. We disclaim any and all warranties, either express or implied, including but not limited to any warranty of noninfringement, merchantability, and/ or fitness for a particular purpose. We do not warrant that the technology will meet your requirements, that the operation thereof will be uninterrupted or error-free, or that any errors will be corrected.
Any use of these scripts and tools is at your own risk. There is no guarantee that they have been through thorough testing in a comparable environment and we are not responsible for any damage or data loss incurred with their use.
You are responsible for reviewing and testing any scripts you run thoroughly before use in any non-testing environment.

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
