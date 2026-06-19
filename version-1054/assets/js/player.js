(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var message = box.querySelector(".play-message");
    var src = box.getAttribute("data-src");
    var hls = null;
    var initialized = false;

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function init() {
      if (initialized || !video || !src) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showMessage("播放遇到问题，请稍后重试");
            }
          }
        });
      } else {
        video.src = src;
      }
      video.setAttribute("controls", "controls");
    }

    function start() {
      init();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage("点击视频区域继续播放");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!initialized || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        showMessage("");
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
