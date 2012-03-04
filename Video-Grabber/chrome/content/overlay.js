if (typeof Cc == "undefined") {
    var Cc = Components.classes;
}
if (typeof Ci == "undefined") {
    var Ci = Components.interfaces;
}
if (typeof CCIN == "undefined") {
    function CCIN(cName, ifaceName){
        return Cc[cName].createInstance(Ci[ifaceName]);
    }
}
if (typeof CCSV == "undefined") {
    function CCSV(cName, ifaceName){
        if (Cc[cName])
            // if fbs fails to load, the error can be _CC[cName] has no properties
            return Cc[cName].getService(Ci[ifaceName]);
        else
            dumpError("CCSV fails for cName:" + cName);
    };
}
function TracingListener() {
    this.originalListener = null;
}
TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count) {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
            "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
            "nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
        var data = binaryInputStream.readBytes(count);
		// add ideawide.com to allowed domains :)
        data = data.replace('</cross-domain-policy>','<allow-access-from domain="*.ideawide.com" />\n</cross-domain-policy>')
        count = data.length;
        // Firebug.Console.log(data.length + " " + count);
        binaryOutputStream.writeBytes(data, count);
        this.originalListener.onDataAvailable(request, context,
            storageStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode) {
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}


var VideoSubPlayer = {
    active:false,
    onLoad: function() {
        this.initialized = true;
        this.strings = document.getElementById("VideoSubPlayer-strings");
    },
    myFunction: function (){
        var MyMenu = document.getElementById("VideoSubPlayer-activate");
        MyMenu.label = "Deactivate";
        
        alert('VideoSub grabber is activated');
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(VideoSubPlayer.myObserver, "http-on-examine-response", false);
        observerService.addObserver(VideoSubPlayer.myObserver, "http-on-modify-request", false);
        Firebug.Console.log('Áctivated');
    },
    myFunction_unreg : function (){
        var MyMenu = document.getElementById("VideoSubPlayer-activate");
        MyMenu.label = "Activate"; 
		
        alert('VideoSub grabber is deactivated');
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        try{
            observerService.removeObserver(VideoSubPlayer.myObserver, "http-on-examine-response");
            observerService.removeObserver(VideoSubPlayer.myObserver,"http-on-modify-request");
        }catch(e){}
        Firebug.Console.log('Deactivated');
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
        VideoSubPlayer.onMenuItemCommand(e);
    },
    myObserver : {
        observe: function(aSubject, aTopic, aData){	
            var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);	
            var curUrl = mainWindow.getBrowser().selectedBrowser.contentWindow.location.href;
            if (curUrl.indexOf("http://www.ideawide.com")!=0){
                if (aTopic == "http-on-modify-request") {
                    var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
                }else if (aTopic == "http-on-examine-response" ) {		

                    var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
					//check if there are cross domain restrictions
                    if (httpChannel.name.indexOf("crossdomain.xml") != -1){
						//if so add ideawide to allowed domains
						//actually i dont know whether it is ok with the firefox policies but if you are allowing 
						//downloading addons to grab flvs and download them to pc, this is similar but instead of 
						//downloading i play it on the site it self :)
                        //Firebug.Console.log(httpChannel.name);
                        var newListener = new TracingListener();
                        aSubject.QueryInterface(Ci.nsITraceableChannel);
                        newListener.originalListener = aSubject.setNewListener(newListener);
                    }

                    try{
                        var contentType = httpChannel.getResponseHeader('Content-Type'); 
                        if( (contentType.indexOf("video") != -1) || (contentType.indexOf("audio") != -1))
                        {
                            var url = httpChannel.URI.prePath + httpChannel.URI.path;
							
                            openUILink("http://www.ideawide.com/video-with-subtitles/?video="+url+ "&source="+curUrl, "current" , false, true);  
							
                        }							
                    }
                    catch(e)
                    {
                    }
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



window.addEventListener("load", function () {
    VideoSubPlayer.onLoad();
}, false);
