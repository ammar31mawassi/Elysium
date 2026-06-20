import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Login from "@/pages/Login";
import { base44 } from "@/api/base44Client";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockCheckUserAuth = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/base44Client", () => ({
  base44: {
    auth: {
      loginViaEmailPassword: vi.fn(),
    },
  },
}));

vi.mock("@/lib/AuthContext", () => ({
  useAuth: () => ({
    checkUserAuth: mockCheckUserAuth,
  }),
}));

vi.mock("@/components/AuthLayout", () => ({
  default: ({ title, subtitle, footer, children }) => (
    <main>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
      <footer>{footer}</footer>
    </main>
  ),
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.auth.loginViaEmailPassword.mockResolvedValue({ access_token: "token" });
    mockCheckUserAuth.mockResolvedValue();
  });

  it("returns to the requested local route after email login", async () => {
    render(
      <MemoryRouter initialEntries={["/login?next=%2Fcalendar"]}>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(base44.auth.loginViaEmailPassword).toHaveBeenCalledWith("student@example.com", "12345678");
    });
    expect(mockCheckUserAuth).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/calendar", { replace: true });
  });

  it("offers email login without a Google provider option", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue with Google" })).not.toBeInTheDocument();
  });

  it("does not keep the clear token flag in the post-login route", async () => {
    render(
      <MemoryRouter initialEntries={["/login?next=%2Fcalendar%3Fclear_access_token%3Dtrue"]}>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/calendar", { replace: true });
    });
  });
});
