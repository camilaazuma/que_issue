"use strict";

var saveHostsAndReapply = function (hosts) {
  chrome.storage.sync.set({ hosts: hosts }, function () {
    reapplyHosts(hosts);
  });
};

var reapplyHosts = function (hosts) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    for (var i = 0; i < hosts.length; i++) {
      chrome.declarativeContent.onPageChanged.addRules([
        {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { hostEquals: hosts[i] },
            }),
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()],
        },
      ]);
    }
  });
};

var getAndApplyHosts = function () {
  chrome.storage.sync.get("hosts", function (data) {
    var hosts;
    if (data.hosts && data.hosts.length) {
      hosts = data.hosts;
    } else {
      hosts = ["inspira.atlassian.net"];
    }
    console.log(hosts);
    reapplyHosts(hosts);
  });
};

chrome.runtime.onInstalled.addListener(function () {
  getAndApplyHosts();
  console.log("que_issue - onInstalled");
});

chrome.runtime.onStartup.addListener(function () {
  getAndApplyHosts();
  console.log("que_issue - onStartup");
});

// self.addEventListener("message", function (event) {
//   if (event.data && event.data.type === "SAVE_HOSTS") {
//     saveHostsAndReapply(event.data.hosts);
//   }
// });

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action == "SAVE_HOSTS") {
    console.log(request);
    // saveHostsAndReapply(event.data.hosts);
  }
});
