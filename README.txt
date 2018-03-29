### qCode Tower Defense - Gear 'em up ###

This is a tower defense game running on a browser powered by A-Frame. https://aframe.io/
It needs to be hosted on a webserver like every other website.

### Server - Installation ###

The directory "Server" contains the server application and the executable.
There are no dependencies to this directory. Copy it where ever you like or leave it there.
You can start the server with the following command (you can choose another port if you like):

./towerdefense_server.x86_64 -batchmode -nographics -port 8080

### Client - Installation / Configuration ###

This client connects to a server via. websocket in order to work.
It is just a visual representation of the game which is running on the server.
If you haven't set up the server, please proceed with the installation guide for the server.

To establish a connection to the game server mentioned above,
open the "config.js" file and enter all the required information.
Now start the server, if you haven't already, and open the client in your browser.

You have successfully established a connection if you can see "Connection Status: online" in the upper left corner.
You can now start to play. Press "H" to view instructions and controls for the game.
If your connection status is "offline", then open the developer console in the browser and see if errors show up.
Otherwise, the game server isn't running or isn't reachable.