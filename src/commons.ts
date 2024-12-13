"use strict";
import * as vscode from "vscode";
import { Environment } from "./environmentPath";
import localize from "./localize";
import { CustomConfig } from "./models/customConfig.model";
import { ExtensionConfig } from "./models/extensionConfig.model";
import { LocalConfig } from "./models/localConfig.model";
import { AutoUploadService } from "./service/autoUpload.service";
import { File, FileService } from "./service/file.service";
import { ExtensionInformation } from "./service/plugin.service";
import { WebviewService } from "./service/webview.service";
import { state } from "./state";

export default class Commons {
  public static outputChannel: vscode.OutputChannel = null;
  public static LogException(
    error: any,
    message: string,
    msgBox: boolean,
    callback?: () => void
  ): void {
    if (error) {
      console.error(error);
      if (error.status === 500) {
        message = localize("common.error.connection");
        msgBox = false;
      } else if (error.status === 401) {
        msgBox = true;
        message = localize("common.error.invalidToken");
      } else if (error.status === 4) {
        message = localize("common.error.canNotSave");
      } else if (error.message) {
        try {
          message = JSON.parse(error.message).message;
          if (message.toLowerCase() === "not found") {
            msgBox = true;
            message = localize("common.error.invalidGistId");
          }
        } catch (error) {
          //  message = error.message;
        }
      }
    }

    if (msgBox === true) {
      vscode.window.showErrorMessage(message);
      vscode.window.setStatusBarMessage("").dispose();
    } else {
      vscode.window.setStatusBarMessage(message, 5000);
    }

    if (callback) {
      callback.apply(this);
    }
  }

  public static GetInputBox(token: boolean) {
    if (token) {
      const options: vscode.InputBoxOptions = {
        placeHolder: localize("common.placeholder.enterGithubAccessToken"),
        password: false,
        prompt: localize("common.prompt.enterGithubAccessToken"),
        ignoreFocusOut: true
      };
      return options;
    } else {
      const options: vscode.InputBoxOptions = {
        placeHolder: localize("common.placeholder.enterGistId"),
        password: false,
        prompt: localize("common.prompt.enterGistId"),
        ignoreFocusOut: true
      };
      return options;
    }
  }

  public autoUploadService: AutoUploadService;
  public webviewService = new WebviewService();

  public ERROR_MESSAGE: string = localize("common.error.message");

  constructor() {
    this.InitializeAutoUpload();
  }

  public async InitializeAutoUpload() {
    const ignored = AutoUploadService.GetIgnoredItems(
      await this.GetCustomSettings()
    );
    this.autoUploadService = new AutoUploadService(ignored);
  }

  public async HandleStartWatching() {
    if (this.autoUploadService) {
      this.autoUploadService.StartWatching();
    } else {
      await this.InitializeAutoUpload();
      this.HandleStartWatching();
    }
  }

  public async HandleStopWatching() {
    if (this.autoUploadService) {
      this.autoUploadService.StopWatching();
    } else {
      await this.InitializeAutoUpload();
      this.HandleStopWatching();
    }
  }

  public async InitalizeSettings(): Promise<LocalConfig> {
    const settings = new LocalConfig();
    const extSettings = this.GetSettings();
    const cusSettings = await this.GetCustomSettings();

    settings.customConfig = cusSettings;
    settings.extConfig = extSettings;
    return settings;
  }

  public async GetCustomSettings(): Promise<CustomConfig> {
    let customSettings = new CustomConfig();
    try {
      const customExist: boolean = await FileService.FileExists(
        state.environment.FILE_CUSTOMIZEDSETTINGS
      );
      if (customExist) {
        const customSettingStr: string = await FileService.ReadFile(
          state.environment.FILE_CUSTOMIZEDSETTINGS
        );
        const tempObj = JSON.parse(customSettingStr);

        Object.assign(customSettings, tempObj);
        customSettings.token = customSettings.token.trim();
      }
    } catch (e) {
      customSettings = null;
      Commons.LogException(
        e,
        "Sync : Unable to read " +
          state.environment.FILE_CUSTOMIZEDSETTINGS_NAME +
          ". Make sure its Valid JSON.",
        true
      );
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(
          "http://shanalikhan.github.io/2017/02/19/Option-to-ignore-settings-folders-code-settings-sync.html"
        )
      );
    }
    return customSettings;
  }

  public async SetCustomSettings(setting: CustomConfig): Promise<boolean> {
    try {
      await FileService.WriteFile(
        state.environment.FILE_CUSTOMIZEDSETTINGS,
        JSON.stringify(setting, null, 4)
      );
      return true;
    } catch (e) {
      Commons.LogException(
        e,
        "Sync : Unable to write " +
          state.environment.FILE_CUSTOMIZEDSETTINGS_NAME,
        true
      );
      return false;
    }
  }

  public async StartMigrationProcess(): Promise<boolean> {
    const fileExist: boolean = await FileService.FileExists(
      state.environment.FILE_CUSTOMIZEDSETTINGS
    );
    let customSettings: CustomConfig = null;
    const firstTime: boolean = !fileExist;
    let fileChanged: boolean = firstTime;

    if (fileExist) {
      customSettings = await this.GetCustomSettings();
    } else {
      customSettings = new CustomConfig();
    }
    // vscode.workspace.getConfiguration().update("sync.version", undefined, true);

    if (firstTime) {
      const openExtensionPage = localize("common.action.openExtPage");
      vscode.window.showInformationMessage(localize("common.info.installed"));
      vscode.window
        .showInformationMessage(
          localize("common.info.needHelp"),
          openExtensionPage
        )
        .then((val: string) => {
          if (val === openExtensionPage) {
            vscode.commands.executeCommand(
              "vscode.open",
              vscode.Uri.parse(
                "https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync"
              )
            );
          }
        });
    } else if (customSettings.version < Environment.CURRENT_VERSION) {
      fileChanged = true;
      // #TODO : Remove this in new update
      const newIgnoredList = new CustomConfig().ignoreUploadFiles;
      newIgnoredList.forEach(m => {
        if (customSettings.ignoreUploadFiles.indexOf(m) === -1) {
          customSettings.ignoreUploadFiles.push(m);
        }
      });

      if (state.context.globalState.get("synctoken")) {
        const token = state.context.globalState.get("synctoken");
        if (token !== "") {
          customSettings.token = String(token);
          state.context.globalState.update("synctoken", "");
          vscode.window.showInformationMessage(
            localize("common.info.setToken")
          );
        }
      }

      const releaseNotes = localize("common.action.releaseNotes");
      const writeReview = localize("common.action.writeReview");
      const support = localize("common.action.support");
      const joinCommunity = localize("common.action.joinCommunity");
      if (!customSettings.disableUpdateMessage) {
        vscode.window
          .showInformationMessage(
            localize("common.info.updateTo", Environment.getVersion()),
            releaseNotes,
            writeReview,
            support,
            joinCommunity
          )
          .then((val: string) => {
            if (val === releaseNotes) {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(
                  "http://shanalikhan.github.io/2016/05/14/Visual-studio-code-sync-settings-release-notes.html"
                )
              );
            }
            if (val === writeReview) {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(
                  "https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync#review-details"
                )
              );
            }
            if (val === support) {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(
                  "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP-DonationsBF:btn_donate_SM.gif:NonHosted"
                )
              );
            }
            if (val === joinCommunity) {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(
                  "https://join.slack.com/t/codesettingssync/shared_invite/enQtNzQyODMzMzI5MDQ3LWNmZjVkZjE2YTg0MzY1Y2EyYzVmYThmNzg2YjZkNjhhZWY3ZTEzN2I3ZTAxMjkwNWU0ZjMyZGFhMjdiZDI3ODU"
                )
              );
            }
          });
      }
    }

    if (fileChanged) {
      customSettings.version = Environment.CURRENT_VERSION;
      await this.SetCustomSettings(customSettings);
    }
    return true;
  }

  public async SaveSettings(setting: ExtensionConfig): Promise<boolean> {
    const config = vscode.workspace.getConfiguration("sync");
    const allKeysUpdated = new Array<Thenable<void>>();

    const keys = Object.keys(setting);
    keys.forEach(async keyName => {
      if (setting[keyName] == null) {
        setting[keyName] = "";
      }
      if (keyName.toLowerCase() !== "token") {
        if (config.get(keyName) !== setting[keyName]) {
          allKeysUpdated.push(config.update(keyName, setting[keyName], true));
        }
      }
    });

    try {
      await Promise.all(allKeysUpdated);
      if (state.context.globalState.get("syncCounter")) {
        const counter = state.context.globalState.get("syncCounter");
        let count: number = parseInt(counter + "", 10);
        if (count % 450 === 0) {
          this.DonateMessage();
        }
        count = count + 1;
        state.context.globalState.update("syncCounter", count);
      } else {
        state.context.globalState.update("syncCounter", 1);
      }
      return true;
    } catch (err) {
      Commons.LogException(err, this.ERROR_MESSAGE, true);
      return false;
    }
  }

  public async DonateMessage(): Promise<void> {
    const donateNow = localize("common.action.donate");
    const writeReview = localize("common.action.writeReview");
    const res = await vscode.window.showInformationMessage(
      localize("common.info.donate"),
      donateNow,
      writeReview
    );

    if (res === donateNow) {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(
          "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP-DonationsBF:btn_donate_SM.gif:NonHosted"
        )
      );
    } else if (res === writeReview) {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(
          "https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync#review-details"
        )
      );
    }
  }

  public GetSettings(): ExtensionConfig {
    const settings = new ExtensionConfig();

    for (const key of Object.keys(settings)) {
      if (key !== "token") {
        settings[key] = vscode.workspace.getConfiguration("sync").get(key);
      }
    }

    settings.gist = settings.gist.trim();
    return settings;
  }

  public async GetTokenAndSave(sett: CustomConfig): Promise<string> {
    const opt = Commons.GetInputBox(true);

    const token = ((await vscode.window.showInputBox(opt)) || "").trim();

    if (token && token !== "esc") {
      sett.token = token;
      const saved = await this.SetCustomSettings(sett);
      if (saved) {
        vscode.window.setStatusBarMessage(
          localize("common.info.tokenSaved"),
          1000
        );
      }
    }

    return token;
  }
  public async GetGistAndSave(sett: ExtensionConfig): Promise<string> {
    const opt = Commons.GetInputBox(false);

    const gist = ((await vscode.window.showInputBox(opt)) || "").trim();

    if (gist && gist !== "esc") {
      sett.gist = gist;
      const saved = await this.SaveSettings(sett);
      if (saved) {
        vscode.window.setStatusBarMessage(
          localize("common.info.gistSaved"),
          1000
        );
      }
      return gist;
    }
  }

  /**
   * IgnoreSettings
   */
  public async GetIgnoredSettings(settings: string[]): Promise<object> {
    const ignoreSettings: object = {};
    const config = vscode.workspace.getConfiguration();
    const keysUpdated: Array<Thenable<void>> = [];

    for (const key of settings) {
      let keyValue: object = null;
      keyValue = config.get<null>(key, null);
      if (keyValue !== null) {
        ignoreSettings[key] = keyValue;
        keysUpdated.push(config.update(key, undefined, true));
      }
    }

    await Promise.all(keysUpdated);

    return ignoreSettings;
  }

  /**
   * RestoreIgnoredSettings
   */
  public SetIgnoredSettings(ignoredSettings: object): void {
    const config = vscode.workspace.getConfiguration();
    const keysUpdated: Array<Thenable<void>> = [];
    for (const key of Object.keys(ignoredSettings)) {
      keysUpdated.push(config.update(key, ignoredSettings[key], true));
    }
  }

  /**
   * AskGistDescription
   */
  public async AskGistDescription(): Promise<string> {
    return vscode.window.showInputBox({
      prompt: localize("common.prompt.multipleGist"),
      ignoreFocusOut: true,
      placeHolder: localize("common.placeholder.multipleGist")
    });
  }

  public ShowSummaryOutput(
    upload: boolean,
    files: File[],
    removedExtensions: ExtensionInformation[],
    addedExtensions: ExtensionInformation[],
    ignoredExtensions: ExtensionInformation[],
    syncSettings: LocalConfig
  ) {
    if (Commons.outputChannel === null) {
      Commons.outputChannel = vscode.window.createOutputChannel(
        "Code Settings Sync"
      );
    }

    const outputChannel = Commons.outputChannel;
    outputChannel.appendLine(
      `CODE SETTINGS SYNC ${upload ? "UPLOAD" : "DOWNLOAD"} SUMMARY`
    );
    outputChannel.appendLine(`Version: ${Environment.getVersion()}`);
    outputChannel.appendLine(`--------------------`);
    outputChannel.appendLine(
      `GitHub Token: ${
        syncSettings.customConfig.token
          ? syncSettings.customConfig.token.slice(0, 4) + "**********"
          : "Anonymous"
      }`
    );
    outputChannel.appendLine(`GitHub Gist: ${syncSettings.extConfig.gist}`);
    outputChannel.appendLine(
      `GitHub Gist Type: ${syncSettings.publicGist ? "Public" : "Secret"}`
    );
    outputChannel.appendLine(``);
    if (!syncSettings.customConfig.token) {
      outputChannel.appendLine(
        `Anonymous Gist cannot be edited, the extension will always create a new one during upload.`
      );
    }
    outputChannel.appendLine(
      `Restarting Visual Studio Code may be required to apply color and file icon theme.`
    );
    outputChannel.appendLine(`--------------------`);

    outputChannel.appendLine(`Files ${upload ? "Upload" : "Download"}ed:`);
    files
      .filter(item => item.fileName.indexOf(".") > 0)
      .forEach(item => {
        outputChannel.appendLine(`  ${item.fileName} > ${item.gistName}`);
      });

    outputChannel.appendLine(``);
    outputChannel.appendLine(`Extensions Ignored:`);

    if (!ignoredExtensions || ignoredExtensions.length === 0) {
      outputChannel.appendLine(`  No extensions ignored.`);
    } else {
      ignoredExtensions.forEach(extn => {
        outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
      });
    }

    outputChannel.appendLine(``);
    outputChannel.appendLine(`Extensions Removed:`);

    if (!syncSettings.extConfig.removeExtensions) {
      outputChannel.appendLine(`  Feature Disabled.`);
    } else {
      if (!removedExtensions || removedExtensions.length === 0) {
        outputChannel.appendLine(`  No extensions removed.`);
      } else {
        removedExtensions.forEach(extn => {
          outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
        });
      }
    }

    if (addedExtensions) {
      outputChannel.appendLine(``);
      outputChannel.appendLine(`Extensions Added:`);

      if (addedExtensions.length === 0) {
        outputChannel.appendLine(`  No extensions installed.`);
      }

      addedExtensions.forEach(extn => {
        outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
      });
    }

    outputChannel.appendLine(`--------------------`);
    outputChannel.append(`Done.`);
    outputChannel.show(true);
  }
}
