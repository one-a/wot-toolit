var PortManager = {
  port_map: {},
  getPort: function(portType, portNumber) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var portName = portType + portNumber;
      var port = self.port_map[portName];
      if (port) {
        resolve(port);
      } else {
        navigator.requestI2CAccess().then(
          function(i2c) {
            var port = i2c.open(portNumber);
            self.port_map[portName] = port;
            resolve(port);
          }
        );
      }
    });
  }
}
