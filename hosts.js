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

var getAndApplyHosts = function () {
    chrome.storage.sync.get('hosts', function(data) {
        var hosts;
        if(data.hosts && data.hosts.length){
            hosts = data.hosts;
        } else {
            hosts = ['makrogroup.atlassian.net'];
        }
        console.log(hosts);
        reapplyHosts(hosts);

      });
};
