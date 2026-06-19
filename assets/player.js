(function () {
  function setupPlayer(box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".video-overlay");
    if (!video) {
      return;
    }

    function attachSource(src) {
      if (!src) {
        return;
      }
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
        video.hlsInstance = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.dataset.loaded = "true";
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        video.dataset.loaded = "true";
        return;
      }

      video.src = src;
      video.dataset.loaded = "true";
    }

    function playVideo() {
      var src = video.getAttribute("data-src");
      if (!video.dataset.loaded) {
        attachSource(src);
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    box.addEventListener("click", function (event) {
      if (event.target.closest(".source-btn")) {
        return;
      }
      if (event.target === video) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  function setupSources() {
    document.querySelectorAll(".source-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetId = button.getAttribute("data-target");
        var video = document.getElementById(targetId);
        var src = button.getAttribute("data-source");
        if (!video || !src) {
          return;
        }
        var shell = video.closest("[data-video-player]");
        document.querySelectorAll('.source-btn[data-target="' + targetId + '"]').forEach(function (item) {
          item.classList.toggle("is-current", item === button);
        });
        video.dataset.loaded = "";
        video.setAttribute("data-src", src);
        if (shell) {
          var overlay = shell.querySelector(".video-overlay");
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
          shell.click();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-video-player]").forEach(setupPlayer);
    setupSources();
  });
})();
