import { AxiosError } from "axios";
import { describe, it, expect } from "vitest";
import { getApiErrorMessage } from "@/lib/apiError";

describe("getApiErrorMessage", () => {
  it("returns the API message from an AxiosError response", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      data: { success: false, message: "Invalid email address" },
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    });
    expect(getApiErrorMessage(error, "Fallback")).toBe("Invalid email address");
  });

  it("returns the first field error when no top-level message", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 422,
      data: {
        success: false,
        message: "",
        errors: [{ field: "email", message: "Email is required" }],
      },
      statusText: "Unprocessable Entity",
      headers: {},
      config: {} as never,
    });
    expect(getApiErrorMessage(error, "Fallback")).toBe("Email is required");
  });

  it("falls back to error.message for non-Axios errors", () => {
    const error = new Error("Something broke");
    expect(getApiErrorMessage(error, "Fallback")).toBe("Something broke");
  });

  it("returns the fallback for unknown payloads", () => {
    expect(getApiErrorMessage(null, "Fallback text")).toBe("Fallback text");
    expect(getApiErrorMessage(undefined, "Fallback text")).toBe("Fallback text");
  });

  it("returns fallback when AxiosError has no response data message", () => {
    const error = new AxiosError("Network Error");
    expect(getApiErrorMessage(error, "Fallback text")).toBe("Network Error");
  });
});