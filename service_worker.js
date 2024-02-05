"use strict";

var saveHostsAndReapply = function (hosts) {
  chrome.storage.sync.set({ hosts: hosts }, function () {
    reapplyHosts(hosts);
  });
};

var reapplyHosts = function (hosts) {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    let rules = hosts.map((host) => {
      return {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: host },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      };
    });
    chrome.declarativeContent.onPageChanged.addRules(rules);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "save_and_apply_hosts") {
    saveHostsAndReapply(request.hosts);
  }
});
