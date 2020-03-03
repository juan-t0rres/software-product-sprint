// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

async function getData() {
    const response = await fetch('/data');
    const comments = await response.json();
    let html = "";
    for(const comment of comments) {
        html += "<div class=\"comment\">";
        html += `<p>${comment.message}</p>`;
        html += `<p><small>${comment.firstName} ${comment.lastName}</small></p>`;
        html += "</div>";
    }
    document.getElementById('data-container').innerHTML = html;
}
