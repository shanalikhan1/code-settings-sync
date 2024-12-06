import { expect } from "chai";

import { File, FileService } from "../../../src/service/file.service";

describe("FileService", () => {
  it("should get custom file info", async () => {
    const expected = new File(
      "dummyrc",
      '{\n  "hoge": true,\n}',
      __dirname + "/../../../../test/service/fileService/dummyrc",
      "|customized_sync|dummyrc"
    );
    const actual = await FileService.GetCustomFile(
      __dirname + "/../../../../test/service/fileService/dummyrc", // __dirname => out/src/test/service
      "dummyrc"
    );
    expect(actual).to.deep.equals(expected);
  });

  it("should return null if file does not exists", async () => {
    const actual = await FileService.GetCustomFile(
      __dirname + "/../../../../test/service/fileService/hoge",
      "hoge"
    );
    expect(actual).to.be.equals(null);
  });

  it("should join by path separator", () => {
    const actual = FileService.ConcatPath(
      "/User/path/to",
      "hoge/piyo",
      "hoge.txt"
    );
    expect(actual).to.be.equals("/User/path/to/hoge/piyo/hoge.txt");
  });
});
