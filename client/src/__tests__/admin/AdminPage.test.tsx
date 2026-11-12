import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";

import AdminPage from "@/pages/admin/AdminPage";
import { renderWithProviders } from "../helpers";
import {
  mockFaults,
  mockAdminUsers,
  mockAdminStats,
  mockAdminSurveys,
} from "../mocks/handlers";

function renderAdmin(route = "/admin") {
  return renderWithProviders(
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/:tab" element={<AdminPage />} />
    </Routes>,
    { route },
  );
}

describe("AdminPage", () => {
  it("renders the admin dashboard heading", async () => {
    renderAdmin();
    expect(
      await screen.findByRole("heading", { name: "Admin Console" }),
    ).toBeInTheDocument();
  });

  it("renders stats cards with correct values", async () => {
    renderAdmin();
    expect(await screen.findByText(mockAdminStats.totalUsers.toString())).toBeInTheDocument();
    expect(screen.getByText("registered accounts")).toBeInTheDocument();
    expect(screen.getByText(mockAdminStats.totalSurveys.toString())).toBeInTheDocument();
    expect(screen.getByText("across all users")).toBeInTheDocument();
    expect(screen.getByText(mockAdminStats.totalResponses.toString())).toBeInTheDocument();
    expect(screen.getByText("total submissions")).toBeInTheDocument();
  });

  it("reveals the users management tab with the user list", async () => {
    renderAdmin("/admin/users");
    expect(await screen.findByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText(/alice@test\.com/)).toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
    expect(screen.getByText(/bob@test\.com/)).toBeInTheDocument();

    expect(
      screen.getByText("Review and manage all registered accounts on the platform."),
    ).toBeInTheDocument();
  });

  it("shows user survey and response counts", async () => {
    renderAdmin("/admin/users");
    expect(await screen.findByText(/3 surveys/)).toBeInTheDocument();
    expect(screen.getByText(/5 responses/)).toBeInTheDocument();
  });

  it("reveals the surveys oversight tab with the survey list", async () => {
    renderAdmin("/admin/surveys");
    expect(
      await screen.findByText("Customer Satisfaction Survey"),
    ).toBeInTheDocument();
    expect(screen.getByText("Employee Engagement Survey")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("renders survey owner and counts", async () => {
    renderAdmin("/admin/surveys");
    expect(
      await screen.findByText(/Alice Admin/),
    ).toBeInTheDocument();
    expect(screen.getByText(/5 questions/)).toBeInTheDocument();
  });

  it("reveals the audit logs tab", async () => {
    renderAdmin("/admin/audit");
    expect(
      await screen.findByText("System Audit Logs"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("No audit log entries recorded yet."),
    ).toBeInTheDocument();
  });

  it("shows loading states while data is fetching", () => {
    renderAdmin();
    const loaders = screen.getAllByRole("status");
    expect(loaders.length).toBeGreaterThan(0);
  });

  it("filters users by search input on Enter", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const input = await screen.findByPlaceholderText("Search by name or email...");
    await user.type(input, "carol");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Carol Creator")).toBeInTheDocument();
    expect(screen.queryByText("Bob Builder")).not.toBeInTheDocument();
    expect(screen.queryByText("Alice Admin")).not.toBeInTheDocument();
  });

  it("promotes a user from USER to ADMIN", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const makeAdminButton = (await screen.findAllByRole("button", {
      name: "Make Admin",
    }))[0];
    await user.click(makeAdminButton);

    await waitFor(() =>
      expect(screen.queryAllByText("admin")).toHaveLength(2),
    );
  });

  it("demotes a user from ADMIN to USER", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const demoteButton = await screen.findByRole("button", {
      name: "Demote",
    });
    await user.click(demoteButton);

    await waitFor(() =>
      expect(screen.queryByText("admin")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.queryAllByText("user")).toHaveLength(5),
    );
  });

  it("opens a confirmation dialog when deactivate is clicked", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const deleteButton = await screen.findByRole("button", {
      name: "Deactivate Bob Builder",
    });
    await user.click(deleteButton);

    expect(
      await screen.findByRole("heading", { name: "Deactivate user account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bob Builder will lose access immediately/),
    ).toBeInTheDocument();
  });

  it("confirms deletion and closes the dialog", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const deleteButton = await screen.findByRole("button", {
      name: "Deactivate Bob Builder",
    });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole("button", {
      name: "Deactivate user",
    });
    await user.click(confirmButton);

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Deactivate user account" }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.queryByText("Bob Builder")).not.toBeInTheDocument(),
    );
  });

  it("cancels the deletion dialog", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/users");

    const deleteButton = await screen.findByRole("button", {
      name: "Deactivate Bob Builder",
    });
    await user.click(deleteButton);

    const cancelButton = await screen.findByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(
      screen.queryByRole("heading", { name: "Deactivate user account" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
  });

  it("filters surveys by status", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/surveys");

    const select = await screen.findByRole("combobox");
    await user.selectOptions(select, "PUBLISHED");

    expect(screen.queryByText("Employee Engagement Survey")).not.toBeInTheDocument();
    expect(screen.queryByText("Product Feedback Survey")).not.toBeInTheDocument();
    expect(await screen.findByText("Customer Satisfaction Survey")).toBeInTheDocument();
  });

  it("renders pagination controls when there are multiple pages of users", async () => {
    const extra = Array.from({ length: 10 }, (_, i) => ({
      id: `extra-${i}`,
      name: `Extra User ${i + 1}`,
      email: `extra${i}@test.com`,
      role: "USER",
      createdAt: "2026-06-01T00:00:00.000Z",
      _count: { surveys: 0, responses: 0 },
    }));
    mockAdminUsers.push(...extra);

    renderAdmin("/admin/users");

    expect(await screen.findByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows an error message when stats request fails", async () => {
    mockFaults.statsError = true;
    renderAdmin("/admin");

    expect(
      await screen.findByRole("alert"),
    ).toBeInTheDocument();
    expect(screen.getByText("Internal server error")).toBeInTheDocument();
  });

  it("shows empty state when there are no users", async () => {
    mockAdminUsers.length = 0;
    renderAdmin("/admin/users");
    expect(
      await screen.findByText("No users found matching your search."),
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no surveys", async () => {
    mockAdminSurveys.length = 0;
    renderAdmin("/admin/surveys");
    expect(
      await screen.findByText("No surveys found matching the selected filters."),
    ).toBeInTheDocument();
  });
});