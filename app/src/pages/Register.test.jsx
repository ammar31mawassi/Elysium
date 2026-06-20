import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Register from "@/pages/Register";

vi.mock("@/api/base44Client", () => ({
  base44: {
    auth: {
      register: vi.fn(),
      verifyOtp: vi.fn(),
      setToken: vi.fn(),
      resendOtp: vi.fn(),
    },
  },
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

vi.mock("@/components/ui/use-toast", () => ({ toast: vi.fn() }));

describe("Register", () => {
  it("offers email registration without a Google provider option", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue with Google" })).not.toBeInTheDocument();
  });
});
