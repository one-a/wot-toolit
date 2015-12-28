var Main = {
  setCalendarID: function(redID, greenID, blueID) {
    Main.red_id = redID;
    Main.green_id = greenID;
    Main.blue_id = blueID;
  },
  start: function() {
    Main.update();
  },

  update: function() {
    Promise.all([Main.getData(Main.red_id), Main.getData(Main.green_id), Main.getData(Main.blue_id)])
    .then(values => {
      var now = new Date();
      var r = Main.isOntime(values[0].feed, now) ? 255 : 0;
      var g = Main.isOntime(values[1].feed, now) ? 255 : 0;
      var b = Main.isOntime(values[2].feed, now) ? 255 : 0;
      var led = document.getElementById("led");
      led.style.color = "rgb("+r+","+g+","+b+")"
      setTimeout(Main.update, 1000*15);
    },
    function(errors) {
      console.log(errors);
      setTimeout(Main.update, 1000*15);
    });
  },

  isOntime: function(feed, now) {
    var entries = feed.entry;
    if (!entries) {
      return false;
    }
    var yNOW = now.getFullYear();
    var mNOW = now.getMonth()+1;
    var dNOW = now.getDate();
    for (var i = 0, n = entries.length; i < n; i++) {
      var entry = entries[i];
      var match = /(\d{4})\/(\d{2})\/(\d{2})(\D+(\d{2}):(\d{2})[^:]+(\d{2}):(\d{2}))?/.exec(entry.content.$t);
      var year = parseInt(match[1]);
      var month = parseInt(match[2]);
      var date = parseInt(match[3]);
      if (year == yNOW && month == mNOW && date == dNOW) {
        if (!match[4]) {
          return true;
        }
        var hNOW = now.getHours();
        var mNOW = now.getMinutes();
        var hSTART = parseInt(match[5]);
        var mSTART = parseInt(match[6]);
        var hEND = parseInt(match[7]);
        var mEND = parseInt(match[8]);
        var comparableNOW = hNOW * 60 + mNOW;
        var comparableSTART = hSTART * 60 + mSTART;
        var comparableEND = hEND * 60 + mEND;
        if (comparableSTART <= comparableNOW && comparableNOW <= comparableEND) {
          return true;
        }
      }
    }
    return false;
  },

  getData: function(id) {
    return new Promise(function(resolve, reject) {
      var time = (new Date()).getTime();
      var url = "http://www.google.com/calendar/feeds/" + id + "/public/basic?alt=json&orderby=starttime&max-results=15&singleevents=true&sortorder=ascending&futureevents=true&nocash="+time;
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.open("GET", url, true);
      console.log(url);
      xhr.onload = function (e) {
        console.log(xhr.responseText);
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.onerror = function (e) {
        reject(xhr.statusText);
      };
      xhr.send(null);
    });
  }
}

window.addEventListener("load", function() {
  CSSDeviceManager.start();
  Main.setCalendarID(
    "j9igotjf644a1i8tggpqs1ijbc%40group.calendar.google.com",
    "2i13vq0slo5i5brcspaphh5b7c%40group.calendar.google.com",
    "ri6cb1018nf2lts8fd7aopb9lo%40group.calendar.google.com"
  );
  Main.start();
});
