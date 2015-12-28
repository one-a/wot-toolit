/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var CSSDeviceManager = {
  device_number: 0,
  device_map:{},
  style_observer_config: {attributes: true},
  start: function() {
    var self = this;
    self.style_observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName == "style" || mutation.attributeName == "class") {
          var cssDeviceElement = mutation.target;
          deviceNumber = cssDeviceElement.dataset.deviceNumber;
          var cssDevice = self.device_map[deviceNumber];
          self.update(cssDevice, cssDeviceElement);
        }
      });
    });

    var childObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var children = mutation.addedNodes;
        for (var i = 0, n = children.length; i < n; i++) {
          var child = children[i];
          var config = child.dataset.cssDevice;
          if (config) {
            self.createCSSDevice(config, child);
          }
        }
      });
    });
    childObserver.observe(document.body, {childList: true});

    var cssDeviceElements = document.querySelectorAll("[data-css-device]");
    for (var i = 0, n = cssDeviceElements.length; i < n; i++) {
      var cssDeviceElement = cssDeviceElements[i];
      var cssDevice = self.createCSSDevice(cssDeviceElement.dataset.cssDevice, cssDeviceElement);
    }

  },
  createCSSDevice: function(configString, cssDeviceElement) {
    var configAsJSONString =
      "{" +
      configString.replace(/\s/g, "")
      .replace(/([,:])?([^,;:]*)([,;])/g, "$1\"$2\"$3")
      .replace(/\"(-?[.\d]+)\"/g, "$1")
      .replace(/:(([^,:]+,)+[^;]+);/g, ":[$1];")
      .replace(/;$/g, "")
      .replace(/;/g, ",")
      .replace(/(([-]|\w)+):/g, "\"$1\":") //attribute
      + "}";
    var config = JSON.parse(configAsJSONString);
    var self = this;
    var portType = config["port-type"];
    var portNumber = config["port-number"];
    PortManager.getPort(portType, portNumber).then(
      function(port) {
        var manager = null;
        switch (config.type) {
          case "multi-color-led": {
            manager = MultiColorLEDManager;
            break;
          }
          case "servo": {
            manager = ServoManager;
            break;
          }
        }
        if (manager) {
          manager.createCSSDevice(config, port).then(
            function(cssDevice) {
              self.update(cssDevice, cssDeviceElement);
              var deviceNumber = self.device_number++;
              cssDeviceElement.dataset.deviceNumber = deviceNumber;
              self.device_map[deviceNumber] = cssDevice;
              self.style_observer.observe(cssDeviceElement, self.style_observer_config);
            },
            function(error) {
              throw new Error(error);
            }
          );
        }
      },
      function(error) {
        console.error(error);
      }
    )
  },

  update: function(cssDevice, cssDeviceElement) {
    var style = window.getComputedStyle(cssDeviceElement, null);
    cssDevice.update(style);
  }
}
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
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
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
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
'use strict';

navigator.requestI2CAccess = function() {
  return new Promise(function(resolve, reject) {
    if (navigator.mozI2c) {
      var i2cAccess = new I2CAccess()
      resolve(i2cAccess);
    } else {
      reject({'message':'mozI2c not supported'});
    }
  });
}

function I2CAccess() {
}

I2CAccess.prototype = {
  open: function(portNumber) {
    navigator.mozI2c.open(portNumber);

    return new I2CPort(portNumber);
  }
};

function I2CPort(portNumber) {
  this.init(portNumber);
}

I2CPort.prototype = {
  init: function(portNumber) {
    this.portNumber = portNumber;
  },

  setDeviceAddress: function(deviceAddress) {
    this.deviceAddress = deviceAddress;
    navigator.mozI2c.setDeviceAddress(this.portNumber, this.deviceAddress);
  },

  read8: function(command, isOctet) {
    return new Promise(function(resolve, reject) {
      resolve(navigator.mozI2c.read(this.portNumber, command, true));
    }.bind(this));
  },

  read16: function(command, isOctet) {
    return new Promise(function(resolve, reject) {
      resolve(navigator.mozI2c.read(this.portNumber, command, false));
    }.bind(this));
  },

  write8: function(command, value) {
    return new Promise(function(resolve, reject) {
      navigator.mozI2c.write(this.portNumber, command, value, true);
      resolve(value);
    }.bind(this));
  },

  write16: function(command, value) {
    return new Promise(function(resolve, reject) {
      navigator.mozI2c.write(this.portNumber, command, value, false);
      resolve(value);
    }.bind(this));
  }
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
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
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var Utility = {
  sleep: function(ms, generator) {
    setTimeout(function(){
      try {
        generator.next();
      } catch (e) {
        if (! (e instanceof StopIteration)) throw e;
      }
    }, ms);
  }
}
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var PCA9685Manager = {
  device_map: {},
  getPCA9685:function (port, address) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var addressMap = self.device_map[port];
      if (addressMap) {
        var device = addressMap[address];
        if (device) {
          resolve(device);
          return;
        }
      } else {
        self.device_map[port] = {};
      }
      port.setDeviceAddress(address);
      var thread = (function* (){
        port.write8(0x00, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x01, 0x04);
        yield Utility.sleep(10, thread);
        port.write8(0x00, 0x10);
        yield Utility.sleep(10, thread);
        port.write8(0xfe, 0x64);
        yield Utility.sleep(10, thread);
        port.write8(0x00, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x06, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x07, 0x00);
        yield Utility.sleep(300, thread);
        var device = new PCA9685(port, address);
        self.device_map[port][address] = device;
        resolve(device);
      })();
      thread.next();
    });
  }
}

var PCA9685 = function(port, address) {
  this.port = port;
  this.address = address;
}

PCA9685.prototype = {
  tick_sec: 1 / 61 / 4096,
  pwm:function(pin, pulse) {
    var self = this;
    var port = this.port;
    var address = this.address;
    var portStart = 8;
    var portInterval = 4;
    var ticks = Math.round(pulse / this.tick_sec);
    var tickH = ((ticks >> 8) & 0x0f);
    var tickL = (ticks & 0xff);
    return new Promise(function(resolve, reject) {
      var thread = (function*() {
        port.setDeviceAddress(address);
        var pwmPort =  Math.round(portStart + pin * portInterval);
        port.write8(pwmPort + 1, tickH);
        yield Utility.sleep(1, thread);
        port.write8(pwmPort, tickL);
        resolve();
      })();
      thread.next();
    });
  }
}
