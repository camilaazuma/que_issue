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

  
  if(isTrello(url)) {
    setTrelloIssueCode(url);
    return;
  }

  setJiraIssueCodeFromAPI(url);
});

var getJiraIssue = function(url) {
  var searchParams = {}
  if(Object.keys(url.searchParams).length){
    searchParams = url.searchParams
  } else {
    var search = url.search.substring(1);
    if(search){
      searchParams = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    }
  }
  
  return searchParams.selectedIssue ? searchParams.selectedIssue : url.pathname.replace("\/browse\/", "")
}  

var setJiraIssueCodeFromAPI = function(url) {
  var issue = getJiraIssue(url);

  fetch(url.origin + '/rest/graphql/1/',{
    "headers": {
      "accept": "application/json,text/javascript,*/*",
      "content-type": "application/json",
    },
    "body": "{\"query\":\"query issueDataQuery {\\n        issue(issueIdOrKey: \\\"" + issue + "\\\", latestVersion: true, screen: \\\"view\\\") {\\n            id\\n            viewScreenId\\n            fields {\\n                key\\n                title\\n                editable\\n                required\\n                autoCompleteUrl\\n                allowedValues\\n                content\\n                renderedContent\\n                schema {\\n                    custom\\n                    system\\n                    configuration {\\n        key\\n        value\\n    }\\n    \\n                    items\\n                    type\\n                    renderer\\n                }\\n                configuration\\n            }\\n            expandAssigneeInSubtasks\\n            expandAssigneeInIssuelinks\\n            expandTimeTrackingInSubtasks\\n            systemFields {\\n                descriptionAdf {\\n                    value\\n                }\\n                environmentAdf {\\n        value\\n    }\\n            }\\n            customFields {\\n                textareaAdf {\\n                    key\\n                    value\\n                }\\n            }\\n            tabs {\\n        id\\n        name\\n        items {\\n            id\\n            type\\n        }\\n    }\\n            \\n    isHybridAgilityProject\\n    \\n            \\n    agile {\\n        epic {\\n          key\\n        },\\n    }\\n        }\\n        \\n        project(projectIdOrKey: \\\"ININ\\\") {\\n            id\\n            name\\n            key\\n            projectTypeKey\\n            simplified\\n            avatarUrls {\\n                key\\n                value\\n            }\\n            archived\\n            deleted\\n        }\\n    }\"}",
    "method": "POST",
  })
  .then(function(response) {
    if(response.status == 200){
      return response.json();
    }else{
      alert.innerHTML = "Falha ao obter descrição :(";
      return null;
    }
  })
  .then(function(json) {
    if(json){
      var summary = json.data.issue.fields.find(o => o.key==='summary').content;
      var desc = '[' + issue + '] ' + summary;
      issueDesc.value = desc.trim();
      issueDesc.select();
      //seleciona e copia para o clipboard
      issueDesc.select();
      document.execCommand("copy");
      alert.innerHTML = "Copiado!";
    }
  })
  .catch(function(err) {  
    console.error(err);
    alert.innerHTML = "Falha ao obter descrição :(";
  });
}

//Old way
var setJiraIssueCodeFromHTML = function(url) {  
  var issue = getJiraIssue(url);

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
    console.error(err);
    alert.innerHTML = "Falha ao obter descrição :(";
  });
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