import * as express from "express";
import { Server } from "http";
import fetch from "node-fetch";
import { URL, URLSearchParams } from "url";
import Commons from "../commons";
import { state } from "../state";

export class GitHubOAuthService {
  public app: express.Express;
  public server: Server;

  constructor(public port: number) {
    this.app = express();
    this.app.use(express.json(), express.urlencoded({ extended: false }));
  }

  public async StartProcess(cmd?: string) {
    const customSettings = await state.commons.GetCustomSettings();
    const host = customSettings.githubEnterpriseUrl
      ? new URL(customSettings.githubEnterpriseUrl)
      : new URL("https://github.com");

    this.server = this.app.listen(this.port);
    this.app.get("/callback", async (req, res) => {
      try {
        const params = new URLSearchParams(
          await (await this.getToken(req.param("code"), host)).text()
        );

        res.send(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta
              http-equiv="Content-Security-Policy"
              content="default-src vscode-resource:; form-action vscode-resource:; frame-ancestors vscode-resource:; img-src vscode-resource: https:; script-src 'self' 'unsafe-inline' vscode-resource:; style-src 'self' 'unsafe-inline' vscode-resource:;"
            />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          </head>
          <body>
              <h1>Success! You may now close this tab.</h1>
              <style>
                html, body {
                  background-color: #1a1a1a;
                  color: #c3c3c3;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  width: 100%;
                  margin: 0;
                }
              </style>
          </body>
        </html>
        `);
        this.server.close();

        const token = params.get("access_token");
        this.saveToken(token);

        const user = await this.getUser(token, host);

        const gists: any[] = await this.getGists(token, user, host);

        const gistViewList: any[] = gists.map(m => {
          return {
            id: m.id,
            description: m.description,
            updated_at: m.updated_at
          };
        });

        state.commons.webviewService.OpenGistSelectionpage(gistViewList, cmd);
      } catch (err) {
        const error = new Error(err);
        Commons.LogException(error, state.commons.ERROR_MESSAGE, true);
      }
    });
  }

  public getToken(code: string, host: URL) {
    const params = new URLSearchParams();
    params.append("client_id", "cfd96460d8b110e2351b");
    params.append("client_secret", "ed46bd3a0f736e0da57308e86ca5fa3cf8688582");
    params.append("code", code);

    const promise = fetch(`https://${host.hostname}/login/oauth/access_token`, {
      method: "POST",
      body: params
    });

    promise.catch(err => {
      Commons.LogException(err, "Sync: Invalid GitHub Enterprise URL.", true);
    });

    return promise;
  }

  public async getGists(token: string, user: string, host: URL) {
    const promise = fetch(`https://api.${host.hostname}/users/${user}/gists`, {
      method: "GET",
      headers: { Authorization: `token ${token}` }
    });

    promise.catch(err => {
      Commons.LogException(err, "Sync: Invalid GitHub Enterprise URL.", true);
    });

    const res = await promise;
    const gists = await res.json();
    return gists;
  }

  public async saveToken(token: string) {
    const currentSettings = await state.commons.GetCustomSettings();
    currentSettings.token = token;
    state.commons.SetCustomSettings(currentSettings);
  }

  public async getUser(token: string, host: URL) {
    const promise = fetch(`https://api.${host.hostname}/user`, {
      method: "GET",
      headers: { Authorization: `token ${token}` }
    });

    promise.catch(err => {
      Commons.LogException(err, "Sync: Invalid GitHub Enterprise URL.", true);
    });

    const res = await promise;
    const json = await res.json();
    return json.login;
  }
}
