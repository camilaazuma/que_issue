// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let changeColor = document.getElementById('changeColor');
var issueDesc = document.getElementById("issue-desc");
var alert = document.getElementById("alert");

issueDesc.value = ". . ."

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  var activeTab = tabs[0];
  var url = new URL(activeTab.url);

  var issue = "";
  
  if(isTrello(url)) {
    setTrelloIssueCode(url);
    return;
  }

  issue = getJiraIssue(url);

  fetch(url.origin + '/browse/' + issue)
    .then(function(response) {
      if(response.status == 200){
        return response.text();
      }else{
        alert.innerHTML = "Falha ao obter descrição :(";
        return null;
      }
    })
    .then(function(html) {
      if(html){
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var title = doc.querySelector('title').text;
        issueDesc.value = title.substring(0, title.lastIndexOf(" - ") + 1).trim();
        //seleciona e copia para o clipboard
        issueDesc.select();
        document.execCommand("copy");
        alert.innerHTML = "Copiado!";
      }
    })
    .catch(function(err) {  
      alert.innerHTML = "Falha ao obter descrição :(";
    });
});

var getJiraIssue = function(url) {
  if(url.searchParams.has("selectedIssue")){
    return url.searchParams.get("selectedIssue");
  }else{
    return url.pathname.replace("\/browse\/", "");
  }
}  

var isTrello = function(url) {
  return url.toString().includes("trello");
}

var setTrelloIssueCode = function(url) {
  chrome.storage.sync.get('trelloConfig', function(data) { 
    var issuePattern = data.trelloConfig;
    if(!issuePattern) {
      alert.innerHTML = "Configure o padrão de issue nas configurações da extensão";
      return;
    }

    var issueNumberRegex = /(?<=\/)[\d]+(?=-[^\/]+$)/;
    var issueNumber = url.toString().match(issueNumberRegex);
    if(issueNumber === null) {
      alert.innerHTML = "Falha ao obter a descrição :(";
      return;
    }

    function getIssueDescriptionDOM() {
      var list = document.getElementsByClassName("card-detail-title-assist");
      if(list.length > 0) {
        return list[0].innerText;
      }
      return "";
    }

    chrome.tabs.executeScript({
        code: '(' + getIssueDescriptionDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
      var issueDescription = results;
      
      issueDesc.value = `[${issuePattern}-${issueNumber}] ${issueDescription}`;

      navigator.clipboard.writeText(issueDesc.value).then(function() {
        alert.innerHTML = "Copiado!";
      }, function(err) {
        alert.innerHTML = "Falha ao copiar a descrição :(";
      });
    });

    
  });
}