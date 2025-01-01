import { describe, expect, it } from "@jest/globals"
import {isFieldValid, isValidOrder} from "../../helpers/helper"


describe("isValidOrder helper function", () => {
  it("should return true if asc", () => {
    const isValid = isValidOrder("asc");
    expect(isValid).toBeTruthy();
  });

  it("should return true if desc", () => {
    const isValid = isValidOrder("desc");
    expect(isValid).toBeTruthy();
  });
  it("should return false if it's neither", () => {
    const isValid = isValidOrder("");
    expect(isValid).toBeFalsy();
  });
});
describe("isFieldValid helper function", () => {
  it("should return true if the field is present in the model schema", () => {
    // Define a mock model with a schema that has a 'name' field
    const model = {
      schema: {
        obj: {
          name: String,
          age: Number,
        },
      },
    };

    const result = isFieldValid(model, "name");
    expect(result).toBe(true);
  });

  it("should return false if the field is not present in the model schema", () => {
    // Define a mock model with a schema that has only 'name' and 'age' fields
    const model = {
      schema: {
        obj: {
          name: String,
          age: Number,
        },
      },
    };

    const result = isFieldValid(model, "address");
    expect(result).toBe(false);
  });

  it("should handle empty schema objects", () => {
    // Define a model with an empty schema object
    const model = {
      schema: {
        obj: {},
      },
    };

    const result = isFieldValid(model, "name");
    expect(result).toBe(false);
  });

  it("should return false if the field is not present in the schema object", () => {
    const model = {
      schema: {
        obj: {
          title: String,
          description: String,
        },
      },
    };

    const result = isFieldValid(model, "age");
    expect(result).toBe(false);
  });
});