// @ts-nocheck
const vscode = acquireVsCodeApi();

function sendCommand(command, data) {
  vscode.postMessage({
    command,
    data
  });
}

function appendHTML(parent, html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  while (div.children.length > 0) {
    parent.appendChild(div.children[0]);
  }
  div.remove();
}

const releaseNoteTemplate = `<h5 class="change text-white-50a mx-auto mt-2 mb-2"><span class="badge badge-@COLOR mr-2">@TYPE</span>@NOTE @EXTRA</h5>`;

const notesElement = document.querySelector("#notes");
releaseNotes.changes.forEach(change => {
  const html = releaseNoteTemplate
    .replace(new RegExp("@NOTE", "g"), change.details)
    .replace(new RegExp("@TYPE", "g"), change.type)
    .replace(new RegExp("@COLOR", "g"), change.color)
    .replace(
      new RegExp("@EXTRA", "g"),
      change.author && change.pullRequest
        ? `(Thanks to <a href='https://github.com/${change.author}'>@${change.author}</a> for PR <a href='https://github.com/shanalikhan/code-settings-sync/pull/${change.pullRequest}'>#${change.pullRequest}</a>)`
        : ""
    );
  appendHTML(notesElement, html);
});

const currentVersionElement = document.querySelector("#current-version");
currentVersionElement.innerHTML = releaseNotes.currentVersion;

document.querySelector("#customCheck1").checked = checked === "true";
