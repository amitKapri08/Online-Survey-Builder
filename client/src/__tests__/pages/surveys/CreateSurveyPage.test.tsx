import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import CreateSurveyPage from "@/pages/surveys/CreateSurveyPage";
import { renderWithAuth } from "@/__tests__/helpers";
import { mockAuthUser, resetMockData } from "@/__tests__/mocks/handlers";

function renderPage(route = "/surveys/new") {
  const user = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/surveys/new" element={<CreateSurveyPage />} />
      <Route path="/surveys" element={<div>Surveys Route</div>} />
      <Route path="/dashboard" element={<div>Dashboard Route</div>} />
      <Route path="/templates" element={<div>Templates Route</div>} />
      <Route path="/surveys/:id/edit" element={<div>Edit Survey Route</div>} />
    </Routes>,
    { route, user: mockAuthUser },
  );
  return { user, ...view };
}

describe("CreateSurveyPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the form with all fields", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Create a new survey" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Custom slug")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Allow anonymous responses" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Allow multiple responses per person" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create survey" }),
    ).toBeInTheDocument();
  });

  it("shows a validation error when the title is empty", async () => {
    const { user } = renderPage();

    await user.click(
      await screen.findByRole("button", { name: "Create survey" }),
    );

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("rejects slugs with invalid characters", async () => {
    const { user } = renderPage();

    await user.type(screen.getByLabelText(/Title/), "Nice survey");
    await user.type(screen.getByLabelText("Custom slug"), "Bad Slug!");
    await user.click(screen.getByRole("button", { name: "Create survey" }));

    expect(
      await screen.findByText("Only lowercase letters, numbers, and hyphens"),
    ).toBeInTheDocument();
  });

  it("creates a survey and navigates to the builder", async () => {
    const successSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    const { user } = renderPage();

    await user.type(
      await screen.findByLabelText(/Title/),
      "Customer Feedback 2026",
    );
    await user.click(screen.getByRole("button", { name: "Create survey" }));

    expect(await screen.findByText("Edit Survey Route")).toBeInTheDocument();
    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith("Survey created"),
    );
  });

  it("toggles the options checkboxes", async () => {
    const { user } = renderPage();

    const anonymous = await screen.findByRole("checkbox", {
      name: "Allow anonymous responses",
    });
    const multiple = screen.getByRole("checkbox", {
      name: "Allow multiple responses per person",
    });

    expect(anonymous).not.toBeChecked();
    expect(multiple).not.toBeChecked();

    await user.click(anonymous);
    await user.click(multiple);

    expect(anonymous).toBeChecked();
    expect(multiple).toBeChecked();
  });

  it("navigates to the templates page", async () => {
    const { user } = renderPage();

    await user.click(
      await screen.findByRole("button", { name: "Browse templates" }),
    );

    expect(screen.getByText("Templates Route")).toBeInTheDocument();
  });
});