# File list
files = css-devices/CSSDeviceManager.js \
				css-devices/MultiColorLED.js \
				css-devices/Servo.js \
				css-devices/devices/i2c.js \
				css-devices/devices/PortManager.js \
				css-devices/devices/Utility.js \
				css-devices/devices/PCA9685.js

# Output list
dist = ..
dev = $(dist)/css-devices.js
min = $(dist)/css-devices.min.js

# Default target
all: lib

# Compressed version
$(min): $(dev)
	java -jar tools/yuicompressor-2.4.8.jar --type js --charset utf-8 $^ -o $@

# Debug version
$(dev): $(files)
	cat > $@ $^

lib: $(min)

copy:
	cp $(dev) ./examples/calendar-based-lamp/js/
	cp $(dev) ./examples/stuffed-web/js/
