var MIN_ANGLE = 10;
var MAX_ANGLE = 170;
var Main = {
  start: function() {
    Main.update();
    Main.right_hand_element = document.getElementById("right-hand");
    Main.left_hand_element = document.getElementById("left-hand");
    Main.neck_element = document.getElementById("neck");
    document.getElementById("glad").addEventListener("click", function() {
      Main.glad();
    }, false);
    document.getElementById("sad").addEventListener("click", function() {
      Main.sad();
    }, false);
    document.getElementById("agree").addEventListener("click", function() {
      Main.agree();
    }, false);
    document.getElementById("angry").addEventListener("click", function() {
      Main.angry();
    }, false);
  },
  update: function() {
    var searchKey = encodeURIComponent("#stuffed_web");
    var url = "https://api.twitter.com/1.1/search/tweets.json?q=" + searchKey;
    var secrets = {
      consumerSecret: config.consumer_secret,
      tokenSecret: config.token_secret
    };
    var message = {
      method: "GET",
      action: url,
      parameters: {
        count: 10,
        oauth_version: "1.0",
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: config.consumer_key,
        oauth_token: config.access_token,
      }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, secrets);
    var apiurl = OAuth.addToURL(message.action, message.parameters);
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", apiurl, true);
    xhr.responseType = "json";
    Main.log("START TO GET TWEET");
    xhr.onload = function (e) {
      Main.log("GOT TWEET");
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          Main.log("START ANIMATION");
          Main.startActuation(xhr.response).then(
            function() {
              Main.log("END ANIMATION");
              setTimeout(Main.update, 5000);
            },
            function(e) {
              console.error(e);
            }
          );
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  },
  startActuation: function(json) {
    var latestTweet = json.statuses[0];
    var content = latestTweet.text.replace(/\s#stuffed_web/g, "");
    document.getElementById("current-tweet").style.backgroundImage = "url(" + latestTweet.user.profile_background_image_url + ")";
    document.getElementById("current-tweet-user-icon").src = latestTweet.user.profile_image_url;
    document.getElementById("current-tweet-user-name").textContent = latestTweet.user.name;
    document.getElementById("current-tweet-content").textContent = latestTweet.text;
    var words = content.split(" ");
    var promise = Main.createEmptyPromise();
    words.forEach(function(word) {
      promise = promise.then(function() {
        if (word.length === 0) {
          return Main.wait(1000);
        } else if (word == ":)") {
          return Main.glad();
        } else if (word == ":(") {
          return Main.sad();
        } else if (word == ";)") {
          return Main.agree();
        } else if (word == "&gt;:)") {
          return Main.angry();
        } else {
          return Main.wait(10 * word.length);
        }
      });
    });
    return promise;
  },
  wait: function(time) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, time);
    });
  },
  glad: function() {
    Main.log("GLAD");
    var intervalTime = 500;
    var promise = Main.createEmptyPromise();
    var index = 0;
    for (var i = 0; i < 5; i++) {
      promise = promise.then(function() {
        index += 1;
        Main.setAngleTo(Main.neck_element, MIN_ANGLE);
        if (index % 2 === 0) {
          Main.setAngleTo(Main.left_hand_element, MAX_ANGLE);
          Main.setAngleTo(Main.right_hand_element, MIN_ANGLE);
        } else {
          Main.setAngleTo(Main.left_hand_element, MIN_ANGLE);
          Main.setAngleTo(Main.right_hand_element, MAX_ANGLE);
        }
        return Main.wait(intervalTime);
      });
    }
    return promise;
  },
  sad: function() {
    Main.log("SAD");
    Main.setAngleTo(Main.left_hand_element, MAX_ANGLE);
    Main.setAngleTo(Main.right_hand_element, MAX_ANGLE);
    Main.setAngleTo(Main.neck_element, MAX_ANGLE);
    return Main.wait(3000);
  },
  agree: function() {
    Main.log("AGREE");
    var intervalTime = 500;
    var promise = Main.createEmptyPromise();
    var index = 0;
    for (var i = 0; i < 5; i++) {
      promise = promise.then(function() {
        index += 1;
        if (index % 2 === 0) {
          Main.setAngleTo(Main.neck_element, MAX_ANGLE);
        } else {
          Main.setAngleTo(Main.neck_element, MIN_ANGLE);
        }
        return Main.wait(intervalTime);
      });
    }
  },
  angry: function() {
    Main.log("ANGRY");
    Main.setAngleTo(Main.left_hand_element, MAX_ANGLE);
    Main.setAngleTo(Main.right_hand_element, MAX_ANGLE);
    Main.setAngleTo(Main.neck_element, MAX_ANGLE);
    var intervalTime = 100;
    var promise = Main.wait(3000);
    var index = 0;
    var range = MIN_ANGLE - MAX_ANGLE;
    var frames = 10;
    for (var i = 0; i < frames; i++) {
      promise = promise.then(function() {
        index += 1;
        var angle = MAX_ANGLE + Math.floor(index / frames * range);
        Main.setAngleTo(Main.right_hand_element, angle);
        Main.setAngleTo(Main.neck_element, angle);
        return Main.wait(intervalTime);
      });
    }
    return Main.wait(3000);
  },
  setAngleTo(element, angle) {
    element.setAttribute("style", "transform: rotate("+angle+"deg)")
  },
  createEmptyPromise: function() {
    return new Promise(function(resolve, reject) { resolve(); });
  },
  log: function(message) {
    document.getElementById("status").textContent = message;
  }
}

window.addEventListener("load", function() {
  CSSDeviceManager.start();
  Main.start();
});
