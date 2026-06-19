(function () {
  function mount(mediaUrl) {
    var video = document.getElementById("movieVideo");
    var cover = document.getElementById("playerCover");
    var started = false;
    var hls = null;

    if (!video || !mediaUrl) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function begin() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    mount: mount
  };
})();
