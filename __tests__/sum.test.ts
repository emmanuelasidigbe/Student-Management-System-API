//testing the jest framework
import { describe,expect,test } from "@jest/globals";
import { sum } from "../sum";

describe("sum function", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
