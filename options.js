// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var hostInput = document.getElementById("new-host");//Add a new host.
var addButton = document.getElementById("add");//first button
var hostHolder = document.getElementById("host-list");//ul of #incomplete-hosts
var inputEmptyError = document.getElementById("input-error");//ul of #incomplete-hosts
var inputDuplicateError = document.getElementById("input-error-duplicate");//ul of #incomplete-hosts
var seeRuleset = document.getElementById("see-ruleset");
var ruleset = document.getElementById("ruleset");

// Trello
var trelloIssueConfig = document.getElementById("trello-issue-config"); // exibição de configuração do trello
var trelloIssue = document.getElementById("trello-issue");
var trelloIssueSaveButton = document.getElementById("trello-issue-save");
var trelloShowConfig = document.getElementById("trello-show-config");
var trelloCurrentConfig = document.getElementById("trello-current-config");
var trelloDeleteConfigButton = document.getElementById("trello-delete");
var inputWrongTrelloFormat = document.getElementById("input-wrong-trello-format");

var saveButton = document.getElementById("save");//first button
var savedHosts = [];

//New host list item
var createNewHostElement = function(hostString){

	var listItem = document.createElement("li");

	//label
	var label = document.createElement("label");//label

	//button.delete
	var deleteButton = document.createElement("button");//delete button

	label.innerText = hostString;

	//Each elements, needs appending
	deleteButton.innerText = "Delete";
	deleteButton.className = "delete";
  deleteButton.setAttribute("style", "float: right")

	//and appending.
	listItem.appendChild(label);
	listItem.appendChild(deleteButton);
	return listItem;
}

var addHost = function(){
  clearErrors();
  if(hasErrors()) return;

  var listItem = createNewHostElement(hostInput.value);
  hostHolder.appendChild(listItem);
  bindHostEvents(listItem);

  savedHosts.push(hostInput.value);
  if(isTrelloBoard(hostInput.value)) {
    showElement(trelloIssueConfig);
  }

  hostInput.value = "";
}

var showElement = function(element) {
  element.setAttribute("style", "display: block");
}

var hideElement = function(element) {
  element.setAttribute("style", "display: none");
}

var hasErrors = function() {
  if (hostInput.value == ""){
    setError(inputEmptyError);
    return true;
  } 

  var alreadySaved = savedHosts.includes(hostInput.value);
  if(alreadySaved) {
    setError(inputDuplicateError);
    return true;
  }

  if(isTrelloBoard(hostInput.value) && !isTrelloFormat(hostInput.value)) {
    setError(inputWrongTrelloFormat);
    return true;
  }

  return false;
}

var clearErrors = function() {
  hideElement(inputEmptyError);
  hideElement(inputDuplicateError);
  hideElement(inputWrongTrelloFormat);
}

var setError = function(inputVariable) {
  if(inputVariable) {
    showElement(inputVariable);
  }
}

/* ---- Trello ----*/

var isTrelloBoard = function(host) {
  return host.includes("trello");
}

var isTrelloFormat = function(host) {
  var trelloFormat = /^trello.com$/;
  return trelloFormat.test(host);
}

var saveTrelloConfiguration = function() {
  if(trelloIssue && trelloIssue.value) {
    var config = trelloIssue.value;
    chrome.storage.sync.set({trelloConfig: config}, function() {
      hideElement(trelloIssueConfig);
      trelloIssue.value = '';
      showCurrentTrelloConfiguration(config);
    });
  }
}

function showCurrentTrelloConfiguration(config) {
  showElement(trelloShowConfig);
  trelloCurrentConfig.innerText = config;
}

function deleteTrelloConfiguration() {
  chrome.storage.sync.remove("trelloConfig", function(item) {
    hideElement(trelloShowConfig);
  });
}

/* ---- Fim trello ----*/

var showRuleset = function() {
  ruleset.setAttribute("style", "visibility: visible");
}

var editHost = function(){
  var listItem = this.parentNode;

  var editInput = listItem.querySelector('input[type = text]');
  var label = listItem.querySelector("label");
  var containsClass = listItem.classList.contains("editMode");
  		//If class of the parent is .editmode
  		if(containsClass){

  		//switch to .editmode
  		//label becomes the inputs value.
  			label.innerText = editInput.value;
  		}else{
  			editInput.value = label.innerText;
  		}

  		//toggle .editmode on the parent.
  		listItem.classList.toggle("editMode");
}

//Delete host.
var deleteHost = function(){
		var listItem = this.parentNode;
		var ul = listItem.parentNode;

    var text = listItem.querySelector("label").innerText;
		//Remove the parent list item from the ul.
		ul.removeChild(listItem);

    savedHosts = savedHosts.filter(item => item !== text);
}

//Save and reapply hosts.
var saveHosts = function(){
  saveHostsAndReapply(savedHosts);
}

//The glue to hold it all together.

//Set the click handler to the addHost function.
addButton.onclick = addHost;
saveButton.onclick = saveHosts;
trelloIssueSaveButton.onclick = saveTrelloConfiguration;
trelloDeleteConfigButton.onclick = deleteTrelloConfiguration;
seeRuleset.onclick = showRuleset;

var bindHostEvents = function(hostListItem){
//select ListItems children
	//var editButton = hostListItem.querySelector("button.edit");
	var deleteButton = hostListItem.querySelector("button.delete");

			//Bind editHost to edit button.
			//editButton.onclick = editHost;
			//Bind deleteHost to delete button.
			deleteButton.onclick = deleteHost;
}

var readHostsAndFillElements = function() {
  chrome.storage.sync.get('hosts', function(data) {
    if(data.hosts && data.hosts.length){
      savedHosts = data.hosts;
      for (var i = 0; i<data.hosts.length;i++){
        var listItem = createNewHostElement(data.hosts[i])
        hostHolder.appendChild(listItem);
        bindHostEvents(listItem);
      }
    }
  });
};

var showTrelloIfConfigured = function() {
  chrome.storage.sync.get('trelloConfig', function(data) {
    var issuePattern = data.trelloConfig;
    if(issuePattern) {
      showCurrentTrelloConfiguration(issuePattern);
    }
  });
}

readHostsAndFillElements();
showTrelloIfConfigured();
