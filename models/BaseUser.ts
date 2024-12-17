import { Schema, model } from "mongoose";
import { BaseUser } from "../types/model_types";

// Define the base schema
const BaseUserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: "modelType", // Used to differentiate models
  }
);

// Create the base model
const BaseUser = model<BaseUser>("User", BaseUserSchema);

export default BaseUser;
