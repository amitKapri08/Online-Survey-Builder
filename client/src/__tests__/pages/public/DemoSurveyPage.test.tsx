import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import DemoSurveyPage from "@/pages/public/DemoSurveyPage";
import { renderWithAuth } from "@/__tests__/helpers";

function renderPage() {
  const user = userEvent.setup();
  const view = renderWithAuth(
    <Routes>
      <Route path="/demo" element={<DemoSurveyPage />} />
      <Route path="/" element={<div>Home Route</div>} />
      <Route path="/register" element={<div>Register Route</div>} />
    </Routes>,
    { route: "/demo", user: null },
  );
  return { user, ...view };
}

describe("DemoSurveyPage", () => {
  it("renders a public interactive demo with rating labels", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Customer Satisfaction Survey" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Responses stay in your browser/)).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Very dissatisfied")).toBeInTheDocument();
    expect(screen.getByText("Very satisfied")).toBeInTheDocument();
  });

  it("completes the demo without sending a response", async () => {
    const { user } = renderPage();

    await screen.findByRole("heading", { name: "Customer Satisfaction Survey" });
    await user.click(screen.getByRole("button", { name: "All in one" }));

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: /Very likely/ }));
    await user.click(
      screen.getByRole("button", { name: /Product features & usability/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "Submit All Responses" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Demo complete" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit All Responses" }),
    ).not.toBeInTheDocument();
  });

  it("lets the visitor restart the demo", async () => {
    const { user } = renderPage();

    await screen.findByRole("heading", { name: "Customer Satisfaction Survey" });
    await user.click(screen.getByRole("button", { name: "All in one" }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: /Very likely/ }));
    await user.click(
      screen.getByRole("button", { name: /Product features & usability/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "Submit All Responses" }),
    );

    await screen.findByRole("heading", { name: "Demo complete" });
    await user.click(screen.getByRole("button", { name: /Try the demo again/ }));

    expect(
      screen.getByRole("heading", { name: "Customer Satisfaction Survey" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 4")).toBeInTheDocument();
  });

  it("links to registration from the demo header", async () => {
    const { user } = renderPage();

    await user.click(
      await screen.findByRole("link", { name: "Start building free" }),
    );
    expect(screen.getByText("Register Route")).toBeInTheDocument();
  });
});
