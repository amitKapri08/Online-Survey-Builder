import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import SurveyListPage from "@/pages/surveys/SurveyListPage";
import { renderWithAuth } from "@/__tests__/helpers";
import { mockAuthUser, resetMockData } from "@/__tests__/mocks/handlers";

function renderPage(route = "/surveys") {
  const user = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/surveys" element={<SurveyListPage />} />
      <Route path="/dashboard" element={<div>Dashboard Route</div>} />
      <Route path="/templates" element={<div>Templates Route</div>} />
      <Route path="/surveys/new" element={<div>Create Survey Route</div>} />
      <Route path="/surveys/:id/edit" element={<div>Edit Survey Route</div>} />
    </Routes>,
    { route, user: mockAuthUser },
  );
  return { user, ...view };
}

describe("SurveyListPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the heading, breadcrumb, and survey rows", async () => {
    renderPage();

    expect(
      (await screen.findAllByText("Surveys")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Create, manage, and analyze your surveys.")).toBeInTheDocument();
    expect(
      screen.getAllByText("Dashboard").length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText("My Published Survey")).toBeInTheDocument();
    expect(screen.getByText("Draft Survey")).toBeInTheDocument();

    expect(screen.getByText(/5 questions/)).toBeInTheDocument();
    expect(screen.getByText(/12 responses/)).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("navigates to create a new survey", async () => {
    const { user } = renderPage();

    await user.click(
      (await screen.findAllByRole("button", { name: "New survey" }))[0],
    );

    expect(screen.getByText("Create Survey Route")).toBeInTheDocument();
  });

  it("filters surveys by status", async () => {
    const { user } = renderPage();

    await screen.findByText("My Published Survey");
    await user.selectOptions(screen.getByRole("combobox"), "DRAFT");

    expect(screen.getByText("Draft Survey")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("My Published Survey")).not.toBeInTheDocument(),
    );
  });

  it("searches surveys by title on Enter", async () => {
    const { user } = renderPage();

    await screen.findByText("Draft Survey");
    const searchInput = screen.getByPlaceholderText("Search surveys...");
    await user.type(searchInput, "Draft");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Draft Survey")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("My Published Survey")).not.toBeInTheDocument(),
    );
  });

  it("shows an empty state when no surveys match", async () => {
    const { user } = renderPage();

    await screen.findByText("My Published Survey");
    await user.type(
      screen.getByPlaceholderText("Search surveys..."),
      "no-such-survey",
    );
    await user.keyboard("{Enter}");

    expect(await screen.findByText("No surveys yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your first survey to start collecting responses.",
      ),
    ).toBeInTheDocument();
  });

  it("duplicates a survey and shows a success toast", async () => {
    const successSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    const { user } = renderPage();

    await screen.findByRole("button", {
      name: "Duplicate My Published Survey",
    });
    await user.click(
      screen.getByRole("button", { name: "Duplicate My Published Survey" }),
    );

    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith(
        'Duplicated as "My Published Survey (Copy)"',
      ),
    );
  });

  it("deletes a survey after confirming in the dialog", async () => {
    const successSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    const { user } = renderPage();

    await screen.findByText("My Published Survey");
    const row = screen
      .getByText("My Published Survey")
      .closest("[class*='justify-between']") as HTMLElement;
    const rowButtons = within(row).getAllByRole("button");
    await user.click(rowButtons[rowButtons.length - 1]);

    expect(
      await screen.findByRole("heading", { name: "Delete survey" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith("Survey deleted"),
    );
    await waitFor(() =>
      expect(screen.queryByText("My Published Survey")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Draft Survey")).toBeInTheDocument();
  });

  it("cancels the delete dialog without deleting", async () => {
    const { user } = renderPage();

    await screen.findByText("My Published Survey");
    const row = screen
      .getByText("My Published Survey")
      .closest("[class*='justify-between']") as HTMLElement;
    const rowButtons = within(row).getAllByRole("button");
    await user.click(rowButtons[rowButtons.length - 1]);

    await screen.findByRole("heading", { name: "Delete survey" });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Delete survey" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("My Published Survey")).toBeInTheDocument();
  });
});