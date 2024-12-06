import * as vscode from "vscode";
import { watch } from "vscode-chokidar";
import localize from "../localize";
import lockfile from "../lockfile";
import { CustomConfig } from "../models/customConfig.model";
import { state } from "../state";
import { Util } from "../util";
import { FileService } from "./file.service";

export class AutoUploadService {
  public static GetIgnoredItems(customSettings: CustomConfig) {
    return [
      ...customSettings.ignoreUploadFolders.map(folder => `**/${folder}/**`),
      ...customSettings.ignoreUploadFiles.map(file => `**/${file}`)
    ];
  }

  public watching = false;

  private watcher = watch(state.environment.USER_FOLDER, {
    depth: 2,
    ignored: this.ignored
  });

  constructor(private ignored: string[]) {
    vscode.extensions.onDidChange(async () => {
      if (this.watching && vscode.window.state.focused) {
        console.log("Sync: Extensions changed");
        if (await lockfile.Check(state.environment.FILE_SYNC_LOCK)) {
          return;
        } else {
          await lockfile.Lock(state.environment.FILE_SYNC_LOCK);
        }
        const customConfig = await state.commons.GetCustomSettings();
        if (!customConfig.downloadPublicGist) {
          await this.InitiateAutoUpload();
        }
        await lockfile.Unlock(state.environment.FILE_SYNC_LOCK);
        return;
      }
    });
  }

  public async StartWatching() {
    this.StopWatching();

    this.watching = true;

    this.watcher.addListener("change", async (path: string) => {
      if (this.watching && vscode.window.state.focused) {
        console.log(`Sync: ${FileService.ExtractFileName(path)} changed`);
        if (await lockfile.Check(state.environment.FILE_SYNC_LOCK)) {
          return;
        } else {
          await lockfile.Lock(state.environment.FILE_SYNC_LOCK);
        }

        const customConfig = await state.commons.GetCustomSettings();
        if (customConfig) {
          const fileType: string = path
            .substring(path.lastIndexOf("."), path.length)
            .slice(1);
          if (
            customConfig.supportedFileExtensions.includes(fileType) &&
            !customConfig.downloadPublicGist
          ) {
            await this.InitiateAutoUpload();
          }
        }
        await lockfile.Unlock(state.environment.FILE_SYNC_LOCK);
        return;
      }
    });
  }

  public StopWatching() {
    if (this.watcher) {
      this.watcher.removeAllListeners();
    }
    this.watching = false;
  }

  private async InitiateAutoUpload() {
    const customSettings = await state.commons.GetCustomSettings();

    vscode.window.setStatusBarMessage("").dispose();
    vscode.window.setStatusBarMessage(
      localize("common.info.initAutoUpload").replace(
        "{0}",
        customSettings.autoUploadDelay
      ),
      5000
    );

    await Util.Sleep(customSettings.autoUploadDelay * 1000);

    vscode.commands.executeCommand("extension.updateSettings", "forceUpdate");
  }
}
