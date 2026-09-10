import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { renderWithAuth } from "@/__tests__/helpers";
import { mockAuthUser, resetMockData } from "@/__tests__/mocks/handlers";

function renderPage(route = "/dashboard") {
  const user = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/surveys" element={<div>Surveys Route</div>} />
      <Route path="/surveys/new" element={<div>Create Survey Route</div>} />
      <Route path="/templates" element={<div>Templates Route</div>} />
      <Route path="/surveys/:id/edit" element={<div>Edit Survey Route</div>} />
    </Routes>,
    { route, user: mockAuthUser },
  );
  return { user, ...view };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("greets the user by their first name", async () => {
    renderPage();
    expect(
      await screen.findByText("Welcome back, Me!"),
    ).toBeInTheDocument();
  });

  it("renders the KPI statistic cards", async () => {
    renderPage();

    expect(await screen.findByText("Total Surveys")).toBeInTheDocument();
    expect(screen.getByText("Total Responses")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    expect(screen.getByText("Total Views")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getAllByText("20%").length).toBeGreaterThan(0);
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("renders recent surveys with counts and action buttons", async () => {
    renderPage();

    const surveyTitles = await screen.findAllByText("My Published Survey");
    expect(surveyTitles.length).toBeGreaterThan(0);
    expect(screen.getByText("Published")).toBeInTheDocument();

    expect(screen.getAllByText(/12 responses/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Copy public link" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Edit survey" }).length,
    ).toBeGreaterThan(0);
  });

  it("renders the recent submissions feed", async () => {
    renderPage();
    expect(await screen.findByText("Recent Submissions")).toBeInTheDocument();
    expect(
      await screen.findByText("Responder One"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("My Published Survey").length,
    ).toBeGreaterThan(0);
  });

  it("copies the public link and shows a toast", async () => {
    const successSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    const infoSpy = vi.spyOn(toast, "info").mockImplementation(() => "");

    const { user } = renderPage();
    await screen.findByRole("button", { name: "Copy public link" });
    await user.click(screen.getByRole("button", { name: "Copy public link" }), {
      pointerEventsCheck: 0,
    });

    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith(
        'Copied link for "My Published Survey"',
      ),
    );
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("navigates to the create survey page", async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole("button", { name: "New survey" }));
    expect(screen.getByText("Create Survey Route")).toBeInTheDocument();
  });

  it("navigates to the survey list", async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole("button", { name: "Manage surveys" }));
    expect(screen.getByText("Surveys Route")).toBeInTheDocument();
  });

  it("navigates to the survey list via View all", async () => {
    const { user } = renderPage();
    await user.click(
      await screen.findByRole("button", { name: "View all (3)" }),
    );
    expect(screen.getByText("Surveys Route")).toBeInTheDocument();
  });
});