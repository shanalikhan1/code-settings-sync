import * as vscode from "vscode";
import { Environment } from "../environment";
import { CustomConfig } from "../models/custom-config.model";
import { ExtensionConfig } from "../models/extension-config.model";
import { ILocalConfig } from "../models/local-config.model";
import { SyncMethod } from "../models/sync-method.model";
import { state } from "../state";
import { AutoUploadService } from "./autoUpload.service";
import { FileService } from "./file.service";
import { GistService } from "./gist.service";
import { LoggerService } from "./logger.service";

export class SettingsService {
  public async GetCustomSettings(): Promise<CustomConfig> {
    const customSettings = new CustomConfig();
    try {
      const customExist: boolean = await FileService.FileExists(
        state.environment.FILE_CUSTOMIZEDSETTINGS
      );
      if (customExist) {
        const customSettingStr: string = await FileService.ReadFile(
          state.environment.FILE_CUSTOMIZEDSETTINGS
        );

        Object.assign(customSettings, JSON.parse(customSettingStr));
      }
    } catch (e) {
      LoggerService.LogException(
        e,
        `Sync : Unable to read ${state.environment.FILE_CUSTOMIZEDSETTINGS_NAME}. Make sure its Valid JSON.`,
        true
      );
    }
    return customSettings;
  }

  public async SetCustomSettings(settings: CustomConfig): Promise<boolean> {
    try {
      return FileService.WriteFile(
        state.environment.FILE_CUSTOMIZEDSETTINGS,
        JSON.stringify(settings, null, 4)
      );
    } catch (e) {
      LoggerService.LogException(
        e,
        `Sync: Unable to write to ${state.environment.FILE_CUSTOMIZEDSETTINGS_NAME}`,
        true
      );
      return false;
    }
  }

  public GetExtensionSettings(): ExtensionConfig {
    const settings = new ExtensionConfig();

    Object.keys(settings).forEach(key => {
      settings[key] = vscode.workspace.getConfiguration("sync").get(key);
    });

    settings.gist = settings.gist.trim();
    return settings;
  }

  public async SetExtensionSettings(
    settings: ExtensionConfig
  ): Promise<boolean> {
    const config = vscode.workspace.getConfiguration("sync");
    const allKeysUpdated = new Array<Thenable<void>>();

    const keys = Object.entries(settings);
    keys.forEach(async ([key, value]) => {
      if (!value) {
        value = new ExtensionConfig()[key];
      }
      if (config.get(key) !== value) {
        allKeysUpdated.push(config.update(key, value, true));
      }
    });

    try {
      await Promise.all(allKeysUpdated);
      if (state.context.globalState.get("syncCounter")) {
        const counter = state.context.globalState.get("syncCounter");
        let count: number = parseInt(counter + "", 10);
        if (count % 450 === 0) {
          this.ShowDonationMessage();
        }
        count = count + 1;
        state.context.globalState.update("syncCounter", count);
      } else {
        state.context.globalState.update("syncCounter", 1);
      }
      return true;
    } catch (err) {
      LoggerService.LogException(err, LoggerService.defaultError, true);
      return false;
    }
  }

  public async GetLocalConfig(): Promise<ILocalConfig> {
    const settings: ILocalConfig = {
      extConfig: state.settings.GetExtensionSettings(),
      customConfig: await state.settings.GetCustomSettings()
    };

    if (!(await state.syncService.IsConfigured())) {
      state.webview.OpenLandingPage();
    }

    return settings;
  }

  public async ResetSettings(): Promise<void> {
    const extSettings = new ExtensionConfig();
    const localSettings = new CustomConfig();

    vscode.window.setStatusBarMessage(
      state.localize("cmd.resetSettings.info.resetting"),
      2000
    );

    try {
      const extSaved: boolean = await this.SetExtensionSettings(extSettings);
      const customSaved: boolean = await this.SetCustomSettings(localSettings);

      state.syncService.Reset();

      if (extSaved && customSaved) {
        vscode.window.showInformationMessage(
          state.localize("cmd.resetSettings.info.settingClear")
        );
        state.webview.UpdateSettingsPage(localSettings, extSettings);
      }
    } catch (err) {
      LoggerService.LogException(
        err,
        "Sync: Unable to clear settings. Error logged to the console.",
        true
      );
    }
  }

  public async OpenAdvancedOptions() {
    const setting: ExtensionConfig = await this.GetExtensionSettings();
    const customSettings: CustomConfig = await this.GetCustomSettings();
    if (customSettings == null) {
      vscode.window
        .showInformationMessage(
          state.localize("cmd.otherOptions.triggerReset"),
          state.localize("common.button.yes")
        )
        .then(val => {
          if (val === state.localize("common.button.yes")) {
            vscode.commands.executeCommand("extension.resetSettings");
          }
        });
    }

    const items: string[] = [
      "cmd.otherOptions.openSettingsPage",
      "cmd.otherOptions.editLocalSetting",
      "cmd.otherOptions.shareSetting",
      "cmd.otherOptions.customizedSync",
      "cmd.otherOptions.downloadCustomFile",
      "cmd.otherOptions.joinCommunity",
      "cmd.otherOptions.openIssue",
      "cmd.otherOptions.releaseNotes"
    ].map(state.localize);

    const item = await vscode.window.showQuickPick(items);

    // if not pick anyone, do nothing
    if (!item) {
      return;
    }

    const index = items.findIndex(v => v === item);

    const handlerMap = [
      async () => {
        state.webview.OpenSettingsPage(customSettings, setting);
      },
      async () => {
        const file: vscode.Uri = vscode.Uri.file(
          state.environment.FILE_CUSTOMIZEDSETTINGS
        );
        const document = await vscode.workspace.openTextDocument(file);
        await vscode.window.showTextDocument(
          document,
          vscode.ViewColumn.One,
          true
        );
      },
      async () => {
        // share public gist
        const answer = await vscode.window.showInformationMessage(
          state.localize("cmd.otherOptions.shareSetting.beforeConfirm"),
          "Yes"
        );

        if (answer === "Yes") {
          await this.SetCustomSettings({
            ...customSettings,
            GitHubGist: {
              ...customSettings.GitHubGist,
              downloadPublicGist: false
            }
          });
          await AutoUploadService.HandleStopWatching();
          await this.SetExtensionSettings({ ...setting, gist: "" });
          await vscode.commands.executeCommand(
            "extension.updateSettings",
            "publicGIST"
          );
        }
      },
      async () => {
        // add customized sync file
        const options: vscode.InputBoxOptions = {
          ignoreFocusOut: true,
          placeHolder: state.localize(
            "cmd.otherOptions.customizedSync.placeholder"
          ),
          prompt: state.localize("cmd.otherOptions.customizedSync.prompt")
        };
        const input = await vscode.window.showInputBox(options);

        if (input) {
          const fileName: string = FileService.ExtractFileName(input);
          if (fileName === "") {
            return;
          }
          customSettings.customFiles[fileName] = input;
          const done: boolean = await this.SetCustomSettings(customSettings);
          if (done) {
            vscode.window.showInformationMessage(
              state.localize("cmd.otherOptions.customizedSync.done", fileName)
            );
          }
        }
      },
      async () => {
        if (customSettings.exportType === SyncMethod.GitHubGist) {
          // Import customized sync file to workspace
          const customFiles = await (state.syncService as GistService).CustomFilesFromGist(
            customSettings,
            setting
          );
          if (customFiles.length < 1) {
            return;
          }
          const options: vscode.QuickPickOptions = {
            ignoreFocusOut: true,
            placeHolder: state.localize(
              "cmd.otherOptions.downloadCustomFile.placeholder"
            )
          };
          const fileName = await vscode.window.showQuickPick(
            customFiles.map(file => {
              return file.fileName;
            }),
            options
          );
          // if not pick anyone, do nothing
          if (!fileName) {
            return;
          }
          const selected = customFiles.find(f => {
            return f.fileName === fileName;
          });
          if (selected && vscode.workspace.rootPath) {
            const downloadPath = FileService.ConcatPath(
              vscode.workspace.rootPath,
              selected.fileName
            );
            const done = await FileService.WriteFile(
              downloadPath,
              selected.content
            );
            if (done) {
              vscode.window.showInformationMessage(
                state.localize(
                  "cmd.otherOptions.downloadCustomFile.done",
                  downloadPath
                )
              );
            }
          }
        }
      },
      async () => {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(
            "https://join.slack.com/t/codesettingssync/shared_invite/enQtMzE3MjY5NTczNDMwLTYwMTIwNGExOGE2MTJkZWU0OTU5MmI3ZTc4N2JkZjhjMzY1OTk5OGExZjkwMDMzMDU4ZTBlYjk5MGQwZmMyNzk"
          )
        );
      },
      async () => {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(
            "https://github.com/shanalikhan/code-settings-sync/issues/new"
          )
        );
      },
      async () => {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(
            "http://shanalikhan.github.io/2016/05/14/Visual-studio-code-sync-settings-release-notes.html"
          )
        );
      }
    ];

    try {
      await handlerMap[index]();
    } catch (err) {
      LoggerService.LogException(err, "Error", true);
      return;
    }
  }

  public async OpenHelp() {
    return vscode.env.openExternal(
      vscode.Uri.parse(
        "https://github.com/shanalikhan/code-settings-sync/wiki/Settings-Guide"
      )
    );
  }

  public async MigrateSettings() {
    const customSettings = await state.settings.GetCustomSettings();
    const newVersion = Number(Environment.version.split(".").join(""));

    if (customSettings.version < newVersion) {
      const defaultIgnoreUploadFiles = new CustomConfig().ignoreUploadFiles;
      defaultIgnoreUploadFiles.forEach(file => {
        if (!customSettings.ignoreUploadFiles.includes(file)) {
          customSettings.ignoreUploadFiles.push(file);
        }
      });

      const defaultIgnoreUploadFolders = new CustomConfig().ignoreUploadFolders;
      defaultIgnoreUploadFolders.forEach(file => {
        if (!customSettings.ignoreUploadFolders.includes(file)) {
          customSettings.ignoreUploadFolders.push(file);
        }
      });

      await state.settings.SetCustomSettings({
        ...customSettings,
        version: newVersion
      });
    }
  }

  public async ShowDonationMessage(): Promise<void> {
    const donateNow = state.localize("common.action.donate");
    const writeReview = state.localize("common.action.writeReview");
    const res = await vscode.window.showInformationMessage(
      state.localize("common.info.donate"),
      donateNow,
      writeReview
    );

    if (res === donateNow) {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP-DonationsBF:btn_donate_SM.gif:NonHosted"
        )
      );
    }

    if (res === writeReview) {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync#review-details"
        )
      );
    }
  }
}
