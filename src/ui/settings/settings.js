// @ts-nocheck

function appendHTML(parent, html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  while (div.children.length > 0) {
    parent.appendChild(div.children[0]);
  }
  div.remove();
}

const vscode = acquireVsCodeApi();

const textInputTemplate = `<div class="form-group mb-4">
            <label for="setting:@correspondingSetting" class="text-white-50a"
              >@name</label
            >
            @tooltip
            <input
              type="text"
              class="form-control text"
              id="setting:@correspondingSetting"
              placeholder="@placeholder"
              setting="@correspondingSetting"
              settingType="@settingType"
            />
          </div>`;

const textInputGroupTemplate = `<div class="mb-4">
          <label for="setting:@correspondingSetting" class="text-white-50a"
            >@name</label
          >
          @tooltip
          <div class="input-group">
            <input
              type="text"
              class="form-control text"
              id="setting:@correspondingSetting"
              placeholder="@placeholder"
              setting="@correspondingSetting"
              settingType="@settingType"
            />
            <div class="input-group-append">
              <button class="btn btn-primary" @disabled onclick="@action" type="button" id="button-addon2">View</button>
            </div>
          </div>
        </div>`;

const numberInputTemplate = `<div class="form-group mb-4">
            <label for="setting:@correspondingSetting" class="text-white-50a"
              >@name</label
            >
            @tooltip
            <input
              type="number"
              class="form-control number"
              id="setting:@correspondingSetting"
              placeholder="@placeholder"
              setting="@correspondingSetting"
              settingType="@settingType"
            />
          </div>`;

const checkboxTemplate = `<div class="custom-control custom-checkbox my-1 mr-sm-2 mb-4">
            <input
              class="custom-control-input checkbox"
              type="checkbox"
              id="setting:@correspondingSetting"
              setting="@correspondingSetting"
              settingType="@settingType"
            />
            <label
              for="setting:@correspondingSetting"
              class="custom-control-label text-white-50a"
            >@name</label>
            @tooltip
          </div>`;

const textareaTemplate = `<div class="form-group mb-3">
            <label
              for="setting:@correspondingSetting"
              class="text-white-50a"
              >@name</label>
              @tooltip
            <textarea
              class="form-control textarea"
              id="setting:@correspondingSetting"
              data-min-rows="1"
              placeholder="@placeholder"
              setting="@correspondingSetting"
              settingType="@settingType"
            ></textarea>
          </div>`;

const globalParent = document.getElementById("globalSettings");
const envParent = document.getElementById("environmentSettings");
const saveStatus = document.getElementById("saveStatus");

globalMap.forEach(settingMap => {
  let template;
  switch (settingMap.type) {
    case "textinput":
      template = textInputTemplate;
      break;
    case "numberinput":
      template = numberInputTemplate;
      break;
    case "checkbox":
      template = checkboxTemplate;
      break;
    case "textarea":
      template = textareaTemplate;
      break;
  }
  const html = template
    .replace(new RegExp("@name", "g"), settingMap.name)
    .replace(new RegExp("@placeholder", "g"), settingMap.placeholder)
    .replace(
      new RegExp("@correspondingSetting", "g"),
      settingMap.correspondingSetting
    )
    .replace(new RegExp("@tooltip"), "")
    .replace(new RegExp("@settingType", "g"), "global");
  appendHTML(globalParent, html);
});

envMap.forEach(envMap => {
  let template;
  switch (envMap.type) {
    case "textinput":
      template = textInputTemplate;
      break;
    case "numberinput":
      template = textInputTemplate;
      break;
    case "checkbox":
      template = checkboxTemplate;
      break;
  }
  const isInputGroup = envMap.correspondingSetting === "gist";
  let disabledStatus = "";
  if (isInputGroup) {
    template = textInputGroupTemplate;
    if (!_.get(envData, "gist") || !_.get(globalData, "token")) {
      disabledStatus = "disabled";
    }
  }
  const html = template
    .replace(new RegExp("@name", "g"), envMap.name)
    .replace(new RegExp("@placeholder", "g"), envMap.placeholder)
    .replace(
      new RegExp("@correspondingSetting", "g"),
      envMap.correspondingSetting
    )
    .replace(
      new RegExp("@tooltip"),
      `
      <a
        class="text-white-50a fas fa-info-circle"
        data-toggle="tooltip" 
        data-placement="right" 
        title="${envMap.tooltip}">
      </a>
      `
    )
    .replace(new RegExp("@settingType", "g"), "env")
    .replace(
      new RegExp("@action", "g"),
      `inputGroupAction('${envMap.correspondingSetting}')`
    )
    .replace(new RegExp("@disabled", "g"), disabledStatus);
  appendHTML(envParent, html);
});

$(document).ready(function() {
  save();
  $('[data-toggle="tooltip"]').tooltip({ container: "html" });
  $(".text")
    .each((i, el) => {
      if ($(el).attr("settingType") === "global") {
        $(el).val(_.get(globalData, $(el).attr("setting")));
      } else {
        $(el).val(envData[$(el).attr("setting")]);
      }
    })
    .change(function() {
      save();
      let val = $(this).val();
      vscode.postMessage({
        command: $(this).attr("setting"),
        text: val,
        type: $(this).attr("settingType")
      });
    });
  $(".number")
    .each((i, el) => {
      if ($(el).attr("settingType") === "global") {
        $(el).val(_.get(globalData, $(el).attr("setting")));
      } else {
        $(el).val(envData[$(el).attr("setting")]);
      }
    })
    .change(function() {
      save();
      let val = Number($(this).val());
      vscode.postMessage({
        command: $(this).attr("setting"),
        text: val,
        type: $(this).attr("settingType")
      });
    });
  $(".checkbox")
    .each((i, el) => {
      if ($(el).attr("settingType") === "global") {
        $(el).prop("checked", _.get(globalData, $(el).attr("setting")));
      } else {
        $(el).prop("checked", envData[$(el).attr("setting")]);
      }
    })
    .change(function() {
      save();
      let val = $(this).is(":checked");
      vscode.postMessage({
        command: $(this).attr("setting"),
        text: val,
        type: $(this).attr("settingType")
      });
    });
  $(".textarea")
    .each((i, el) => {
      let str = "";
      const items = _.get(globalData, $(el).attr("setting"));
      items.forEach(item => (str += item + "\n"));
      $(el).val(str.slice(0, -1));
      $(el).prop("rows", items.length);
    })
    .change(function() {
      save();
      let val = [];
      $(this)
        .val()
        .split("\n")
        .forEach(item => {
          if (item !== "") {
            val.push(item);
          }
        });
      vscode.postMessage({
        command: $(this).attr("setting"),
        text: val,
        type: "global"
      });
    });
});

function save() {
  saveStatus.innerHTML = `<i class="spinner-border dock-bottom-left"></i>`;
  setTimeout(
    () =>
      (saveStatus.innerHTML = `<i class="fas fa-check dock-bottom-left"></i>`),
    1000
  );
}

function inputGroupAction(setting) {
  if (setting === "gist") {
    vscode.postMessage("openGist");
  }
}
