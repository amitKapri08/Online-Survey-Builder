import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import SurveyPublicPage from "@/pages/public/SurveyPublicPage";
import { renderWithAuth } from "@/__tests__/helpers";
import { mockAuthUser, mockPublicSurvey, resetMockData } from "@/__tests__/mocks/handlers";

function renderPage(
  route = "/s/my-published-survey",
  user: typeof mockAuthUser | null = mockAuthUser,
) {
  const testUser = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/s/:slug" element={<SurveyPublicPage />} />
      <Route path="/" element={<div>Home Route</div>} />
      <Route path="/dashboard" element={<div>Dashboard Route</div>} />
      <Route path="/register" element={<div>Register Route</div>} />
    </Routes>,
    { route, user },
  );
  return { user: testUser, ...view };
}

describe("SurveyPublicPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the survey header and first stepped question", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "My Published Survey" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A published survey")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your answer here..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/ })).toBeInTheDocument();
  });

  it("blocks advancing when a required question is empty", async () => {
    const { user } = renderPage();

    await user.click(
      await screen.findByRole("button", { name: /Continue/ }),
    );

    expect(await screen.findByText("This question is required")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("completes the stepped flow and shows the thank-you screen", async () => {
    const { user } = renderPage();

    await user.type(
      await screen.findByPlaceholderText("Type your answer here..."),
      "Alice",
    );
    await user.click(screen.getByRole("button", { name: /Continue/ }));

    expect(await screen.findByText("Question 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("Rate your experience")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));

    expect(await screen.findByText("Question 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("Pick an option")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Option A/ }));
    await user.click(screen.getByRole("button", { name: "Submit response" }));

    expect(
      await screen.findByRole("heading", { name: "Thank you!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your response has been recorded successfully."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel auto-redirect" }));
    expect(screen.getByText("Auto-redirect cancelled.")).toBeInTheDocument();
  });

  it("submits all questions at once in all-in-one mode", async () => {
    const { user } = renderPage();

    await user.click(await screen.findByRole("button", { name: "All in one" }));

    expect(
      screen.getByRole("heading", { name: "What is your name?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Rate your experience" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pick an option" }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Type your answer here..."),
      "Alice",
    );
    await user.click(screen.getByRole("button", { name: /Option A/ }));
    await user.click(
      screen.getByRole("button", { name: "Submit All Responses" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Thank you!" }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable message for an unknown slug", async () => {
    renderPage("/s/does-not-exist");

    expect(
      await screen.findByText("Survey not available"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This survey could not be found, or it is not currently open for responses.",
      ),
    ).toBeInTheDocument();
  });

  it("prompts logged-out visitors to sign in for a non-anonymous survey", async () => {
    renderPage("/s/my-published-survey", null);

    expect(
      await screen.findByRole("heading", { name: "Sign in to respond" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Type your answer here..."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Sign in$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create an account/ }),
    ).toBeInTheDocument();
  });

  it("renders the form for logged-out visitors on an anonymous survey", async () => {
    mockPublicSurvey.isAnonymous = true;
    renderPage("/s/my-published-survey", null);

    expect(
      await screen.findByRole("heading", { name: "My Published Survey" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your answer here..."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Sign in to respond" }),
    ).not.toBeInTheDocument();
  });
});