import { CustomConfig } from "./customConfig.model";
import { ExtensionConfig } from "./extensionConfig.model";

export class LocalConfig {
  public publicGist: boolean = false;
  public userName: string = null;
  public name: string = null;
  public extConfig = new ExtensionConfig();
  public customConfig = new CustomConfig();
}
