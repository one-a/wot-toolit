window.addEventListener("load", function() {
  CSSDeviceManager.start();
  document.getElementById("adc").addEventListener("change", function(e) {
    console.log(e.target.value);
  });
});
