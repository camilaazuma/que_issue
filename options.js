// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var hostInput = document.getElementById("new-host");//Add a new host.
var addButton = document.getElementById("add");//first button
var hostHolder = document.getElementById("host-list");//ul of #incomplete-hosts
var inputError = document.getElementById("input-error");//ul of #incomplete-hosts
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
  if(hostInput.value == ""){
    inputError.setAttribute("style", "visibility: unset")
  }else{
    inputError.setAttribute("style", "visibility: hidden")

    if(savedHosts.includes(hostInput.value) == false){
      var listItem = createNewHostElement(hostInput.value);
    	hostHolder.appendChild(listItem);
    	bindHostEvents(listItem);

      savedHosts.push(hostInput.value);
      hostInput.value = ""
    }else{
      inputError.setAttribute("style", "visibility: unset")
    }
  }
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

//Delete host.
var applyConfigs = function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.storage.sync.set({hosts: savedHosts}, function() {
        for (var i = 0; i < savedHosts.length; i++){
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostEquals: savedHosts[i]},
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
          }]);
        }
      });
    });

}

//The glue to hold it all together.

//Set the click handler to the addHost function.
addButton.onclick = addHost;
saveButton.onclick = applyConfigs;

var bindHostEvents = function(hostListItem){
//select ListItems children
	//var editButton = hostListItem.querySelector("button.edit");
	var deleteButton = hostListItem.querySelector("button.delete");

			//Bind editHost to edit button.
			//editButton.onclick = editHost;
			//Bind deleteHost to delete button.
			deleteButton.onclick = deleteHost;
}

//cycle over hostHolder ul list items
	//for each list item
  chrome.storage.sync.get('hosts', function(data) {
    if(data.hosts){
      if(data.hosts.length){
        savedHosts = data.hosts;
        for (var i = 0; i<data.hosts.length;i++){
          var listItem = createNewHostElement(data.hosts[i])
        	hostHolder.appendChild(listItem);
        	bindHostEvents(listItem);
      	}
      }
    }
  });
