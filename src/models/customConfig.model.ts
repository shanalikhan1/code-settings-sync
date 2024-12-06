import { Environment } from "../environmentPath";

export class CustomConfig {
  public ignoreUploadFiles: string[] = [
    "state.*",
    "syncLocalSettings.json",
    ".DS_Store",
    "sync.lock",
    "projects.json",
    "projects_cache_vscode.json",
    "projects_cache_git.json",
    "projects_cache_svn.json",
    "gpm_projects.json",
    "gpm-recentItems.json"
  ];
  public ignoreUploadFolders: string[] = ["workspaceStorage"];
  public ignoreExtensions: string[] = [];
  public gistDescription: string = "Visual Studio Code Settings Sync Gist";
  public version: number = Environment.CURRENT_VERSION;
  public token: string = "";
  public downloadPublicGist: boolean = false;
  public supportedFileExtensions: string[] = ["json", "code-snippets"];
  public openTokenLink: boolean = true;
  public disableUpdateMessage: boolean = false;
  public lastUpload: Date = null;
  public lastDownload: Date = null;
  public githubEnterpriseUrl: string = null;
  public askGistDescription: boolean = false;
  public customFiles: { [key: string]: string } = {};
  public hostName: string = null;
  public universalKeybindings: boolean = false;
  public autoUploadDelay: number = 20;
}
