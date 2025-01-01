import { describe, expect, it } from "@jest/globals";
import { mergeSort, quickSort } from "../../helpers/sorting_argorithms";

describe("mergeSort", () => {
  it("should sort an array of objects based on a given key", () => {
    const arr = [
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
    ];
    const result = mergeSort(arr, "age");
    expect(result).toEqual([
      { name: "Bob", age: 20 },
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
    ]);
  });

  it("should handle an empty array", () => {
    const result = mergeSort([], "age");
    expect(result).toEqual([]);
  });

  it("should handle an array with a single element", () => {
    const arr = [{ name: "John", age: 25 }];
    const result = mergeSort(arr, "age");
    expect(result).toEqual([{ name: "John", age: 25 }]);
  });

  it("should sort by string keys alphabetically", () => {
    const arr = [
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
    ];
    const result = mergeSort(arr, "name");
    expect(result).toEqual([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
      { name: "John", age: 25 },
    ]);
  });
});


describe("quickSort", () => {
  it("should sort an array of objects based on a given key", () => {
    const arr = [
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
    ];
    const result = quickSort(arr, "age");
    expect(result).toEqual([
      { name: "Bob", age: 20 },
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
    ]);
  });

  it("should handle an empty array", () => {
    const result = quickSort([], "age");
    expect(result).toEqual([]);
  });

  it("should handle an array with a single element", () => {
    const arr = [{ name: "John", age: 25 }];
    const result = quickSort(arr, "age");
    expect(result).toEqual([{ name: "John", age: 25 }]);
  });

  it("should sort by string keys alphabetically", () => {
    const arr = [
      { name: "John", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
    ];
    const result = quickSort(arr, "name");
    expect(result).toEqual([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
      { name: "John", age: 25 },
    ]);
  });
});
