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
  if(url.searchParams.has("selectedIssue")){
    issue = url.searchParams.get("selectedIssue");
  }else{
    issue = url.pathname.replace("\/browse\/", "");
  }

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
        issueDesc.value = doc.querySelector('title').text.replace(" - JIRA", "");
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