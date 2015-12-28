var MultiColorLEDManager = {
  createCSSDevice: function(config, port) {
    return new Promise(function(resolve, reject) {
      PCA9685Manager.getPCA9685(port, config.address).then(
        function(device) {
          var led = new MultiColorLED(config, device);
          resolve(led);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }
}
var MultiColorLED = function(config, device) {
  this.config = config;
  this.device = device;
}

MultiColorLED.prototype = {
  update: function(style) {
    var color = style.color;
    var match = /rgba?\((\d+),\s(\d+),\s(\d+)\)/.exec(color);
    var r = parseInt(match[1]);
    var g = parseInt(match[2]);
    var b = parseInt(match[3]);
    var pins = this.config["pwm-pin"];
    var minPulse = this.config["min-pulse"];
    var maxPulse = this.config["max-pulse"];
    var pulseRange = maxPulse - minPulse;
    r = minPulse + r / 255 * pulseRange;
    g = minPulse + g / 255 * pulseRange;
    b = minPulse + b / 255 * pulseRange;
    var self = this;
    self.device.pwm(pins[0], r)
    .then(function(){
      self.device.pwm(pins[1], g)
      .then(function(){
        self.device.pwm(pins[2], b);
      });
    });
  }
}
