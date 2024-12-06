import { ExtensionContext } from "vscode";
import Commons from "../commons";
import { Environment } from "../environmentPath";

export interface IExtensionState {
  context?: ExtensionContext;
  environment?: Environment;
  commons?: Commons;
  instanceID: string;
}
