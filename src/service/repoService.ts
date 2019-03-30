import { appendFile, existsSync, writeFile } from "fs-extra";
import * as Git from "simple-git/promise";

export class RepoService {
  public git: Git.SimpleGit;
  constructor(
    private options: {
      workingDirectory: string;
      repoURL: string;
      ignored: string[];
    }
  ) {
    this.git = Git(this.options.workingDirectory).silent(true);
    this.checkRepo();
  }

  public async checkRepo() {
    const isRepo = await this.git.checkIsRepo();
    const gitignorePath = `${this.options.workingDirectory}/.gitignore`;
    if (!isRepo) {
      await this.initRepo();
    }
    if (!existsSync(gitignorePath)) {
      await this.updateGitignore(gitignorePath);
      await this.push();
    }
    return true;
  }

  public async initRepo() {
    await this.git.init();
    await this.git.addRemote("origin", this.options.repoURL);
    return true;
  }

  public async pull(options?: { force: boolean }) {
    if (options && options.force) {
      await this.git.pull(this.options.repoURL, "master", { "--force": null });
      return true;
    }
    await this.git.pull(this.options.repoURL, "master");
    return true;
  }

  public async push() {
    await this.git.commit("Update settings", ".");
    await this.git.push(this.options.repoURL, "master");
    return;
  }

  public async updateGitignore(path: string) {
    await writeFile(path, "");
    this.options.ignored.forEach(
      async item => await appendFile(path, item + "\n")
    );
    return true;
  }
}