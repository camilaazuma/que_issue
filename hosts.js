var saveHostsAndReapply = function(hosts){
    chrome.storage.sync.set({hosts: hosts}, function() {
        reapplyHosts(hosts);
    });
};

var reapplyHosts = function(hosts) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        for (var i = 0; i < hosts.length; i++){
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: hosts[i]},
                })],
                actions: [new chrome.declarativeContent.ShowPageAction()]
                }]);
        }
    });
};

