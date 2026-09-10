import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import LandingPage from "@/pages/landing/LandingPage";

function renderPage(route = "/") {
  const user = userEvent.setup();
  const view = render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<div>Login Route</div>} />
          <Route path="/register" element={<div>Register Route</div>} />
          <Route path="/templates" element={<div>Templates Route</div>} />
          <Route path="/privacy" element={<div>Privacy Route</div>} />
          <Route path="/terms" element={<div>Terms Route</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
  return { user, ...view };
}

describe("LandingPage", () => {
  it("renders the hero section and header", () => {
    renderPage();
    expect(screen.getByText("SurveyBuilder")).toBeInTheDocument();
    expect(screen.getByText(/Build surveys people/)).toBeInTheDocument();
    expect(screen.getByText("Modern Feedback Engine")).toBeInTheDocument();
    expect(screen.getByText("Start Building Free")).toBeInTheDocument();
  });

  it("renders the feature grid and templates teaser", () => {
    renderPage();
    expect(screen.getByText("9 Dynamic Question Types")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Analytics & CSV")).toBeInTheDocument();
    expect(screen.getByText("Smart Duplicate Prevention")).toBeInTheDocument();
    expect(screen.getByText("Ready-to-use survey templates")).toBeInTheDocument();
    expect(screen.getByText("Customer Satisfaction (CSAT)")).toBeInTheDocument();
    expect(screen.getByText("Employee Engagement")).toBeInTheDocument();
    expect(screen.getByText("Event Registration")).toBeInTheDocument();
  });

  it("navigates to register from the hero CTA", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Start Building Free"));
    expect(screen.getByText("Register Route")).toBeInTheDocument();
  });

  it("navigates to templates from the demo CTA", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("View Live Demo"));
    expect(screen.getByText("Templates Route")).toBeInTheDocument();
  });

  it("signs in from the header button", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Sign in"));
    expect(screen.getByText("Login Route")).toBeInTheDocument();
  });

  it("registers from the header CTA", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Get started free"));
    expect(screen.getByText("Register Route")).toBeInTheDocument();
  });

  it("lets the visitor click through the live rating preview", async () => {
    const { user } = renderPage();
    const ratingButtons = screen
      .getAllByRole("button")
      .filter((b) => /^[0-6]$/.test(b.textContent ?? ""));
    expect(ratingButtons).toHaveLength(7);

    await user.click(ratingButtons[6]);
    expect(ratingButtons[6].textContent).toBe("6");
  });

  it("links to the legal pages from the footer", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Privacy Policy"));
    expect(screen.getByText("Privacy Route")).toBeInTheDocument();
  });
});