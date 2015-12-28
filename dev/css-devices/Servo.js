var ServoManager = {
  createCSSDevice: function(config, port) {
    return new Promise(function(resolve, reject) {
      PCA9685Manager.getPCA9685(port, config.address).then(
        function(device) {
          var servo = new Servo(config, device);
          resolve(servo);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }
}
var Servo = function(config, device) {
  this.config = config;
  this.device = device;
}

Servo.prototype = {
  TO_DEGREE: 360 / (2 * Math.PI),
  update: function(style) {
    var transform = style.transform;
    //matrix(0, -1, 1, 0, 0, 0)
    var result = /matrix\(([^,]+),\s([^,]+),\s([^,]+),\s([^,]+).*/.exec(transform);
    var m1 = parseFloat(result[1]);
    //var m2 = parseFloat(result[2]);
    //var m3 = parseFloat(result[3]);
    //var m4 = parseFloat(result[4]);
    var radian1 = Math.acos(m1);
    //var radian2 = Math.asin(m2);
    //var radian3 = -Math.asin(m3);
    //var radian4 = Math.acos(m4);
    var degree1 = Math.round(radian1 * this.TO_DEGREE);
    //var degree2 = Math.round(radian2 * this.TO_DEGREE);
    //var degree3 = Math.round(radian3 * this.TO_DEGREE);
    //var degree4 = Math.round(radian4 * this.TO_DEGREE);
    var angle = degree1;
    var pin = this.config["pwm-pin"];
    var minPulse = this.config["min-pulse"];
    var maxPulse = this.config["max-pulse"];
    var pulseRange = maxPulse - minPulse;
    var angleRange = this.config["angle-range"];
    var pulse = minPulse + angle / angleRange * pulseRange;
    this.device.pwm(pin, pulse);
  }
}
