# Gear 'em Down - A-Frame Client

This is a tower defense game running on a browser developed by **Qwellcode GmbH** and powered by [A-Frame](https://aframe.io/). You can host it on a webserver like every other website. The client then connects to the game server with his browser via. websocket. It's just a visual representation of the game logic which runs on the [server](https://github.com/qSteven/GearEmDown-Server).

## Game Server

You can download a compiled version of the game server for Linux here: http://qwellcode.com/github/GearEmDown\_Server\_v1.0.zip

## Installation / Configuration

1. To establish a connection to the game server mentioned above, open the `config.js` file and enter all the required information.
2. If you haven't set up the server, please proceed with the installation guide for the [server](https://github.com/qSteven/GearEmDown-Server).
3. Start the server, if you haven't already, and open the client in your browser.
4. You have successfully established a connection if you can see "Connection Status: **online**" in the upper left corner.
5. You can now start to play. Press "H" to view instructions and controls for the game.

If your connection status is **offline**, open the developer console in the browser and see if errors show up.
Otherwise, the game server isn't running or isn't reachable.

![Unity editor view](http://qwellcode.de/github/GearEmDown_AFrameView.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.