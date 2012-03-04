VideoGrabber.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ VideoGrabber.showFirefoxContextMenu(e); }, false);
};

VideoGrabber.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-VideoGrabber").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { VideoGrabber.onFirefoxLoad(); }, false);
