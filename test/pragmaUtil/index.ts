import { expect } from "chai";
import fs = require("fs");
import { OsType } from "../../src/enums";
import PragmaUtil from "../../src/pragmaUtil";

let testSettings = null;

describe("Process before upload", function() {
  this.beforeAll(() => {
    testSettings = fs.readFileSync(
      __dirname + "/../../../test/pragmaUtil/testSettings.txt",
      "utf8"
    );
  });

  it("should trim os, host and env", async () => {
    const result = await PragmaUtil.processBeforeUpload(testSettings);
    await expect(result).to.match(/@sync os=linux host=trim env=TEST_ENV/);
  });

  it("should uncomment all lines", async () => {
    const commentedSettings = `
      // @sync os=linux
      // "window": 1,
      // @sync os=mac
      // "server": "http://exmaple.com
    `;

    const result = await PragmaUtil.processBeforeUpload(commentedSettings);
    await expect(result)
      .to.match(/\s+"window"/)
      .and.to.match(/\s+"server"/);
  });

  it("should uncomment lines before write file for os=linux", () => {
    const commentedSettings = `{
      // @sync os=linux
      // "linux": 1,
      // @sync os=mac
        "mac": 1
    }`;
    const processed = PragmaUtil.processBeforeWrite(
      commentedSettings,
      commentedSettings,
      OsType.Linux,
      null
    );
    expect(processed)
      .to.match(/\s+"linux"/)
      .and.to.match(/\s+\/\/\s+"mac"/);
  });

  it("should not comment os=linux settings lines", async () => {
    let processed = await PragmaUtil.processBeforeUpload(testSettings);
    processed = PragmaUtil.processBeforeWrite(
      processed,
      processed,
      OsType.Linux,
      null
    );
    expect(processed).to.match(/\s+"not_commented"/);
  });

  it("should leave only settings that matches with os=mac host=mac2 env=TEST_ENV", async () => {
    const processed = await PragmaUtil.processBeforeUpload(testSettings);
    // tslint:disable-next-line:no-string-literal
    process.env["TEST_ENV"] = "1";
    await expect(
      PragmaUtil.processBeforeWrite(processed, processed, OsType.Mac, "mac2")
    )
      .to.match(/\n\s+"mac2"/)
      .and.match(/\n\s+"mactest"/);
  });

  it("should remove all comments and parse JSON", () => {
    const possibleJson = PragmaUtil.removeAllComments(testSettings);
    expect(JSON.parse.bind(null, possibleJson)).to.not.throw();
  });

  it("should parse multi-line settings", () => {
    const commentedSettings = `{
      // @sync os=linux
      "multi": {
            "setting": false,
            "settingWithBrackets": "{} []",
            "multi": {
            }
      },
      // @sync os=mac
      "mac": 1
    }`;
    const processed = PragmaUtil.processBeforeWrite(
      commentedSettings,
      commentedSettings,
      OsType.Mac,
      null
    );
    expect(processed)
      .to.match(/\/{2}\s+"multi"/)
      .and.to.match(/\/{2}\s+"setting"/)
      .and.to.match(/\/{2}\s+"settingWithBrackets"/)
      .and.to.match(/\/{2}\s+},/)
      .and.to.match(/\s+"mac"/);
  });
});
