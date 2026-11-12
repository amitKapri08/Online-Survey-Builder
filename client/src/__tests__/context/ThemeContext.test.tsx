import { afterEach, describe, expect, it } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme, type Theme } from "@/context/ThemeContext";

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>set-dark</button>
      <button onClick={() => setTheme("system")}>set-system</button>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function renderProbe(props: { defaultTheme?: Theme; storageKey?: string } = {}) {
  return render(
    <ThemeProvider defaultTheme={props.defaultTheme} storageKey={props.storageKey}>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("ThemeProvider", () => {
  it("defaults to the 'system' theme and resolved light in jsdom", () => {
    renderProbe();
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  it("uses the provided defaultTheme", () => {
    renderProbe({ defaultTheme: "dark" });
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists theme choice to localStorage", () => {
    renderProbe({ storageKey: "surveyhub-theme" });
    act(() => {
      screen.getByText("set-dark").click();
    });
    expect(localStorage.getItem("surveyhub-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("toggleTheme toggles between light and dark", () => {
    renderProbe({ defaultTheme: "light" });
    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });
});