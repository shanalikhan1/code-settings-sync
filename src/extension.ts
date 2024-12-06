// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Environment } from "./environmentPath";
import { state } from "./state";
import { Sync } from "./sync";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  state.context = context;
  state.environment = new Environment();

  const sync = new Sync();

  sync.bootstrap();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.updateSettings",
      (optArgument?: string) => {
        sync.upload.bind(sync, optArgument)();
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.downloadSettings",
      sync.download.bind(sync)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.resetSettings",
      sync.reset.bind(sync)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.HowSettings",
      sync.how.bind(sync)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.otherOptions",
      sync.advance.bind(sync)
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
