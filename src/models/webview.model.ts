import { WebviewPanel } from "vscode";

export interface IWebview {
  name: string;
  htmlPath: string;
  htmlContent?: string;
  webview?: WebviewPanel;
  replaceables: Array<{}>;
}
