// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let changeColor = document.getElementById('changeColor');
var issueDesc = document.getElementById("issue-desc");

issueDesc.value = ". . ."
setTimeout(function () {
  issueDesc.value = "olar"
}, 300);
