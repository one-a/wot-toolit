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
