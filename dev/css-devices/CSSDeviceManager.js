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
          case "adc": {
            manager = ADCManager;
            break;
          }
        }
        if (manager) {
          manager.createCSSDevice(config, port).then(
            function(cssDevice) {
              var deviceNumber = self.device_number++;
              cssDeviceElement.dataset.deviceNumber = deviceNumber;
              cssDevice.deviceNumber = deviceNumber;
              if (cssDevice.isSensor) {
                cssDevice.setListener(self.listen);
              } else {
                self.update(cssDevice, cssDeviceElement);
                self.device_map[deviceNumber] = cssDevice;
                self.style_observer.observe(cssDeviceElement, self.style_observer_config);
              }
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
  },

  listen: function(value, cssDevice) {
    var selector = "[data-device-number=\""+cssDevice.deviceNumber+"\"]";
    var cssDeviceElement = document.querySelector(selector);
    cssDeviceElement.value = value;
    var event = document.createEvent("HTMLEvents");
    event.initEvent("change", true, false);
    cssDeviceElement.dispatchEvent(event);
  }
}
