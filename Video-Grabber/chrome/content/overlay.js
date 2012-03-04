var VideoSubPlayer = {
	active:false,
	onLoad: function() {
	// initialization code
		//alert("welcome");
		this.initialized = true;
		this.strings = document.getElementById("VideoSubPlayer-strings");
	},
	myFunction: function (){
	   var MyMenu = document.getElementById("VideoSubPlayer-activate");
	   MyMenu.label = "Deactivate"; 
	  //alert("Active");

	   var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	   observerService.addObserver(VideoSubPlayer.myObserver, "http-on-examine-response", false);
	},
	myFunction_unreg : function (){
	   //alert("Deactivated");
	   var MyMenu = document.getElementById("VideoSubPlayer-activate");
	   MyMenu.label = "Activate"; 

	   var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	   //observerService.addObserver(myObserver, "http-on-examine-response", false);
	   try{
			observerService.removeObserver(VideoSubPlayer.myObserver, "http-on-examine-response");
		}catch(e){}
	},
	onMenuItemCommand: function(e) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
									  .getService(Components.interfaces.nsIPromptService);
		var myPanelImage = document.getElementById("VideoSubPlayer-barpanel");
		if(VideoSubPlayer.active == false){
			VideoSubPlayer.myFunction();
			VideoSubPlayer.active = true;
			myPanelImage.setAttribute("image","chrome://VideoSubPlayer/skin/on.gif");
			myPanelImage.setAttribute("tooltiptext","VideoSub Grabber is active. Click here to deactivate");
		}else{
			VideoSubPlayer.myFunction_unreg();
			VideoSubPlayer.active = false;
			myPanelImage.setAttribute("image","chrome://VideoSubPlayer/skin/off.gif");
			myPanelImage.setAttribute("tooltiptext","VideoSub Grabber is deactive. Click here to activate");
		}									
	},

	onToolbarButtonCommand: function(e) {
	// just reuse the function above.  you can change this, obviously!
		VideoSubPlayer.onMenuItemCommand(e);
	},
	myObserver : {
			   observe: function(aSubject, aTopic, aData){			  
					if (aTopic == "http-on-modify-request") {
					   /* var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
						var contentType = httpChannel.getResponseHeader('Content-Type'); 
							//note that here it's called getResponseHeader, but in the other place getRequestHeader
							alert(contentType);*/
						
					}
					else if (aTopic == "http-on-examine-response" ) {
						var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
									   .getInterface(Components.interfaces.nsIWebNavigation)
									   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
									   .rootTreeItem
									   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
									   .getInterface(Components.interfaces.nsIDOMWindow);

						var curUrl = mainWindow.getBrowser().selectedBrowser.contentWindow.location.href;
						var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
						//alert(curUrl);
						try{
							var contentType = httpChannel.getResponseHeader('Content-Type'); 
							//note that here it's called getResponseHeader, but in the other place getRequestHeader

							//alert(curUrl+ " "+  contentType);
							if( (contentType.indexOf("video") != -1) || (contentType.indexOf("audio") != -1) || (contentType.indexOf("application/octet-stream") != -1) || (contentType.indexOf("pdf") != -1))
							{
							// Add flv to list
									var url = httpChannel.URI.prePath + httpChannel.URI.path;
									//dump("ddf");
									//alert(url + " " +  clenKB);
									if (curUrl.indexOf("http://www.youtube.com")==0){
										openUILink("http://www.ideawide.com/video-with-subtitles/?video="+curUrl, "current" , false, true);  
									}else if (curUrl.indexOf("http://www.ideawide.com")!=0){
										openUILink("http://www.ideawide.com/video-with-subtitles/?video="+url, "current" , false, true);  
									}
									
							}
								
							
							
						}
						catch(e)
						{
						}
					}
			   },

			   QueryInterface: function(iid){
					  if (!iid.equals(Components.interfaces.nsISupports) &&
					  !iid.equals(Components.interfaces.nsIObserver))
					  throw Components.results.NS_ERROR_NO_INTERFACE;

					  return this;
			   }
			}
};

window.addEventListener("load", function () { VideoSubPlayer.onLoad(); }, false);
