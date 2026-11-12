import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";
import { resetMockData } from "./mocks/handlers";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });

  if (typeof Blob !== "undefined" && typeof Blob.prototype.stream !== "function") {
    Blob.prototype.stream = function () {
      const self = this;
      return new ReadableStream({
        async pull(controller) {
          const buffer = await self.arrayBuffer();
          controller.enqueue(new Uint8Array(buffer));
          controller.close();
        },
      });
    };
  }

  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
});

afterAll(() => server.close());