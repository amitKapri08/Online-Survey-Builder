import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import EditSurveyPage from "@/pages/surveys/EditSurveyPage";
import { renderWithAuth } from "@/__tests__/helpers";
import { mockAuthUser, resetMockData } from "@/__tests__/mocks/handlers";

function renderPage(route = "/surveys/survey-1/edit") {
  const user = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/surveys/:id/edit" element={<EditSurveyPage />} />
      <Route path="/surveys" element={<div>Surveys Route</div>} />
    </Routes>,
    { route, user: mockAuthUser },
  );
  return { user, ...view };
}

describe("EditSurveyPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays the published survey with builder header", async () => {
    renderPage();

    expect(
      (await screen.findAllByText("My Published Survey")).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText("Share")).toBeInTheDocument();
    expect(screen.getAllByRole("tab", { name: "Build" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("tab", { name: "Settings" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("tab", { name: "Results" }).length).toBeGreaterThan(0);

    expect(await screen.findByText("What is your name?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
  });

  it("shows locked settings for a published survey", async () => {
    const { user } = renderPage();

    await user.click(
      (await screen.findAllByRole("tab", { name: "Settings" }))[0],
    );

    expect(
      await screen.findByText("Survey settings"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Settings are locked once the survey is published."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Custom slug")).toBeDisabled();
    expect(screen.getByLabelText("Description")).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: "Allow anonymous responses" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: "Allow multiple responses per person" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save settings" }),
    ).not.toBeInTheDocument();
  });

  it("switches to the results tab and shows stats", async () => {
    const { user } = renderPage();

    await user.click(
      (await screen.findAllByRole("tab", { name: "Results" }))[0],
    );

    expect((await screen.findAllByText("Responses")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Views").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Questions").length).toBeGreaterThan(0);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Results").length).toBeGreaterThan(0);
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
  });

  it("opens the preview modal with survey questions", async () => {
    const { user } = renderPage();

    await user.click(
      (await screen.findAllByRole("button", { name: "Preview" }))[0],
    );

    expect(await screen.findByText("1. What is your name?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close preview" }),
    ).toBeInTheDocument();
  });

  it("copies the public link when sharing a published survey", async () => {
    const successSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    const { user } = renderPage();

    await user.click(await screen.findByRole("button", { name: "Share" }));

    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith("Link copied to clipboard"),
    );
  });

  it("navigates back to the surveys list", async () => {
    const { user } = renderPage();

    await user.click(
      await screen.findByRole("button", { name: "Back to surveys" }),
    );

    expect(await screen.findByText("Surveys Route")).toBeInTheDocument();
  });
});