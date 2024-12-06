import { Environment } from "../environmentPath";

export class CloudSettings {
  public lastUpload: Date = null;
  public extensionVersion: string = "v" + Environment.getVersion();
}
