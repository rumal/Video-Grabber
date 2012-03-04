VideoSubPlayer.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ VideoSubPlayer.showFirefoxContextMenu(e); }, false);
};

VideoSubPlayer.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-VideoSubPlayer").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { VideoSubPlayer.onFirefoxLoad(); }, false);
