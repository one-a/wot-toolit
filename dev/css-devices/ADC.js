var ADCManager = {
  createCSSDevice: function(config, port) {
    return new Promise(function(resolve, reject) {
      MCP3425Manager.getMCP3425(port, config.address).then(
        function(device) {
          var adc = new ADC(config, device);
          resolve(adc);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }
}
var ADC = function(config, device) {
  this.config = config;
  this.device = device;
}

ADC.prototype = {
  isSensor: true,
  previous_value: 0,
  setListener: function(listener) {
    if (!this.listener) {
      this.start();
    }
    this.listener = listener;
  },
  start: function() {
    var self = this;
    setTimeout(function() {
      self.update();
    }, 10);
  },
  update: function() {
    var self = this;
    this.device.read().then(function(value) {
      if (self.previous_value != value) {
        self.listener(value, self);
        self.previous_value = value;
      }
      setTimeout(function() {
        self.update();
      }, 500);
    });
  }
}
