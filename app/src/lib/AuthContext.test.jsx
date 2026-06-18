import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { createAxiosClient } from "@base44/sdk/dist/utils/axios-client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    auth: {
      me: vi.fn(),
      logout: vi.fn(),
      redirectToLogin: vi.fn(),
    },
  },
}));

vi.mock("@/lib/app-params", () => ({
  appParams: {
    appId: "app-1",
    token: null,
  },
  getCurrentCanonicalAppUrl: () => "https://elysium-nexus-flow.base44.app/",
}));

vi.mock("@base44/sdk/dist/utils/axios-client", () => ({
  createAxiosClient: vi.fn(),
}));

function AuthStateProbe() {
  const { isAuthenticated, isLoadingAuth, authChecked, user } = useAuth();

  return (
    <div>
      <span>{isLoadingAuth ? "loading" : "loaded"}</span>
      <span>{authChecked ? "checked" : "unchecked"}</span>
      <span>{isAuthenticated ? "authenticated" : "guest"}</span>
      <span>{user?.email || "no-user"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockResolvedValue({ id: "app-1", public_settings: {} }),
    });
  });

  it("checks the saved SDK session even without an access_token URL param", async () => {
    base44.auth.me.mockResolvedValue({ id: "user-1", email: "student@example.com" });

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(base44.auth.me).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("authenticated")).toBeInTheDocument();
    expect(screen.getByText("student@example.com")).toBeInTheDocument();
  });

  it("quietly treats a missing saved session as a guest", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    base44.auth.me.mockRejectedValue({ status: 401, message: "Authentication required" });

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("checked")).toBeInTheDocument());
    expect(screen.getByText("guest")).toBeInTheDocument();
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
