
var current_vids;

function get_tab_vids() {
  chrome.tabs.query({active: true,currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {action: "refresh_vids"}, function(response) {});  
  });
}

function get_vids(run_this_function){
  // first refresh the storage with the videos on the page and then
  // retrieves data and runs the function inputted from script.js
  chrome.tabs.query({active: true,currentWindow: true}, function(tabs){
    chrome.tabs.executeScript(tabs[0].id, {file: "js/contentscript.js"});
    chrome.tabs.sendMessage(tabs[0].id, {action: "refresh_vids"}, function(response) {});  
  });
  chrome.storage.local.get('parameters', run_this_function);
}

// identifies when something has been stored
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log("noticed the change");
  var popups = chrome.extension.getViews({type: "popup"});
});


// function to execute upon recieving a message from the content script
function onMessage(request, sender, sendResponse){
  if (request.act == "turn_off_icon"){
    chrome.browserAction.setIcon({path: 'images/play_button.png'});
    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){
        chrome.browserAction.disable(tabs[0].id);
      });
    console.log("turned icon off");
  } else if (request.act == "save_vids"){
    chrome.browserAction.setIcon({path: 'images/favicon.png'});
    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){
        chrome.browserAction.enable(tabs[0].id);
      });
    var page_type = request.page_type;
    current_vids = {'parameters':request}

    // stores data locally
    chrome.storage.local.set({'parameters':request}, function(){
      console.log("saved everything");
    });
    sendResponse({});
  }
}


chrome.extension.onMessage.addListener(onMessage);