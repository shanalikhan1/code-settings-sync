"use strict";

import { normalize, resolve } from "path";
import * as vscode from "vscode";
import { OsType } from "./enums";
import { state } from "./state";

export const SUPPORTED_OS: string[] = Object.keys(OsType)
  .filter(k => !/\d/.test(k))
  .map(k => k.toLowerCase()); // . ["windows", "linux", "mac"];

export function osTypeFromString(osName: string): OsType {
  const capitalized: string =
    osName[0].toUpperCase() + osName.substr(1).toLowerCase();
  return OsType[capitalized];
}

export class Environment {
  public static CURRENT_VERSION: number = 343;
  public static getVersion(): string {
    return (
      Environment.CURRENT_VERSION.toString().slice(0, 1) +
      "." +
      Environment.CURRENT_VERSION.toString().slice(1, 2) +
      "." +
      Environment.CURRENT_VERSION.toString().slice(2, 3)
    );
  }

  // public isInsiders: boolean = false;
  // public isOss: boolean = false;
  // public isCoderCom: boolean = false;
  // public homeDir: string | null = null;

  public isPortable: boolean = false;
  public USER_FOLDER: string = null;

  public CODE_BIN: string;

  public EXTENSION_FOLDER: string = null;
  public PATH: string = null;
  public OsType: OsType = null;

  public FILE_SETTING: string = null;
  public FILE_LAUNCH: string = null;
  public FILE_KEYBINDING: string = null;
  public FILE_LOCALE: string = null;
  public FILE_EXTENSION: string = null;
  public FILE_CLOUDSETTINGS: string = null;
  public FILE_SYNC_LOCK: string = null;

  public FILE_CUSTOMIZEDSETTINGS_NAME: string = "syncLocalSettings.json";
  public FILE_CUSTOMIZEDSETTINGS: string = null;

  public FILE_SETTING_NAME: string = "settings.json";
  public FILE_LAUNCH_NAME: string = "launch.json";
  public FILE_KEYBINDING_NAME: string = "keybindings.json";
  public FILE_KEYBINDING_MAC: string = "keybindingsMac.json";
  public FILE_KEYBINDING_DEFAULT: string = "keybindings.json";
  public FILE_EXTENSION_NAME: string = "extensions.json";
  public FILE_LOCALE_NAME: string = "locale.json";
  public FILE_SYNC_LOCK_NAME: string = "sync.lock";

  public FILE_CLOUDSETTINGS_NAME: string = "cloudSettings";

  public FOLDER_SNIPPETS: string = null;

  constructor() {
    state.context.globalState.update("_", undefined); // Make sure the global state folder exists. This is needed for using this.context.globalStoragePath to access user folder

    this.isPortable = !!process.env.VSCODE_PORTABLE;

    this.OsType = process.platform as OsType;
    if (!this.isPortable) {
      this.PATH = resolve(state.context.globalStoragePath, "../../..").concat(
        normalize("/")
      );
      this.USER_FOLDER = resolve(this.PATH, "User").concat(normalize("/"));
      this.EXTENSION_FOLDER = resolve(
        vscode.extensions.all.filter(
          extension => !extension.packageJSON.isBuiltin
        )[0].extensionPath,
        ".."
      ).concat(normalize("/")); // Gets first non-builtin extension's path
    } else {
      this.PATH = process.env.VSCODE_PORTABLE;
      this.USER_FOLDER = resolve(this.PATH, "user-data/User").concat(
        normalize("/")
      );
      this.EXTENSION_FOLDER = resolve(this.PATH, "extensions").concat(
        normalize("/")
      );
    }

    /* Start Legacy Code

    this.isInsiders = /insiders/.test(this.context.asAbsolutePath(""));
    this.isOss = /\boss\b/.test(this.context.asAbsolutePath(""));
    this.isCoderCom =
      vscode.extensions.getExtension("coder.coder") !== undefined;
    const isXdg =
      !this.isInsiders &&
      !this.isCoderCom &&
      process.platform === "linux" &&
      !!process.env.XDG_DATA_HOME;
    this.homeDir = isXdg
      ? process.env.XDG_DATA_HOME
      : process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
    const configSuffix = `; $; {isXdg || this.isCoderCom ? "" : "."; }vscode$; {
      this.isInsiders ? "-insiders" : this.isOss ? "-oss" : "";
    }`;

    if (!this.isPortable) {
      if (process.platform === "darwin") {
        this.PATH = process.env.HOME + "/Library/Application Support";
        this.OsType = OsType.Mac;
      } else if (process.platform === "linux") {
        if (!this.isCoderCom) {
          this.PATH =
            isXdg && !!process.env.XDG_CONFIG_HOME
              ? process.env.XDG_CONFIG_HOME
              : os.homedir() + "/.config";
        } else {
          this.PATH = "/tmp";
        }
        this.OsType = OsType.Linux;
      } else if (process.platform === "win32") {
        this.PATH = process.env.APPDATA;
        this.OsType = OsType.Windows;
      } else {
        this.PATH = "/var/local";
        this.OsType = OsType.Linux;
      }
    }

    if (this.isPortable) {
      this.PATH = process.env.VSCODE_PORTABLE;
      if (process.platform === "darwin") {
        this.OsType = OsType.Mac;
      } else if (process.platform === "linux") {
        this.OsType = OsType.Linux;
      } else if (process.platform === "win32") {
        this.OsType = OsType.Windows;
      } else {
        this.OsType = OsType.Linux;
      }
    }

    if (!this.isPortable) {
      const possibleCodePaths = [];
      if (this.isInsiders) {
        possibleCodePaths.push("/Code - Insiders");
      } else if (this.isOss) {
        possibleCodePaths.push("/Code - OSS");
        possibleCodePaths.push("/VSCodium");
      } else {
        possibleCodePaths.push("/Code");
      }
      for (const possibleCodePath of possibleCodePaths) {
        try {
          fs.statSync(this.PATH + possibleCodePath);
          this.PATH = this.PATH + possibleCodePath;
          break;
        } catch (e) {
          console.error("Error :" + possibleCodePath);
          console.error(e);
        }
      }
      this.ExtensionFolder = path.join(
        this.homeDir,
        configSuffix,
        "extensions"
      );
      this.USER_FOLDER = this.PATH.concat("/User/");
    } else {
      this.USER_FOLDER = this.PATH.concat("/user-data/User/");
      this.ExtensionFolder = this.PATH.concat("/extensions/");
    }

    End Legacy Code */

    this.FILE_EXTENSION = this.USER_FOLDER.concat(this.FILE_EXTENSION_NAME);
    this.FILE_SETTING = this.USER_FOLDER.concat(this.FILE_SETTING_NAME);
    this.FILE_LAUNCH = this.USER_FOLDER.concat(this.FILE_LAUNCH_NAME);
    this.FILE_KEYBINDING = this.USER_FOLDER.concat(this.FILE_KEYBINDING_NAME);
    this.FILE_LOCALE = this.USER_FOLDER.concat(this.FILE_LOCALE_NAME);
    this.FOLDER_SNIPPETS = this.USER_FOLDER.concat("/snippets/");
    this.FILE_CLOUDSETTINGS = this.USER_FOLDER.concat(
      this.FILE_CLOUDSETTINGS_NAME
    );
    this.FILE_CUSTOMIZEDSETTINGS = this.USER_FOLDER.concat(
      this.FILE_CUSTOMIZEDSETTINGS_NAME
    );
    this.FILE_SYNC_LOCK = this.USER_FOLDER.concat(this.FILE_SYNC_LOCK_NAME);
  }
}
