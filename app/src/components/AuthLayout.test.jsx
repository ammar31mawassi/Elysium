import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AuthLayout from "@/components/AuthLayout";

vi.mock("@/lib/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, setTheme: vi.fn() }),
}));

vi.mock("@/components/elysium/ElysiumLogo", () => ({
  default: () => <img alt="Elysium" />,
}));

function mockMobileViewport({ widthMatches = true, innerHeight = 800, visualHeight = 480 } = {}) {
  const listeners = new Map();
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: widthMatches && query === "(max-width: 767px)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Object.defineProperty(window, "visualViewport", {
    value: {
      height: visualHeight,
      offsetTop: 0,
      addEventListener: vi.fn((type, listener) => listeners.set(type, listener)),
      removeEventListener: vi.fn((type) => listeners.delete(type)),
    },
    configurable: true,
  });
  return listeners;
}

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("adds mobile keyboard space and scrolls a focused password field above the visual viewport", () => {
    mockMobileViewport();

    render(
      <AuthLayout title="Welcome back">
        <input aria-label="Password" type="password" />
      </AuthLayout>
    );

    const shell = document.querySelector("[data-auth-layout]");
    const password = screen.getByLabelText("Password");
    shell.scrollBy = vi.fn();
    password.scrollIntoView = vi.fn();
    password.getBoundingClientRect = vi.fn(() => ({
      top: 690,
      bottom: 738,
      left: 0,
      right: 320,
      width: 320,
      height: 48,
      x: 0,
      y: 690,
      toJSON: () => ({}),
    }));

    expect(shell.style.getPropertyValue("--auth-viewport-height")).toBe("480px");
    expect(shell.style.getPropertyValue("--auth-keyboard-offset")).toBe("320px");
    expect(shell).toHaveAttribute("data-keyboard-open", "true");

    password.focus();
    fireEvent.focusIn(password);
    vi.runOnlyPendingTimers();

    expect(shell.scrollBy).toHaveBeenCalledWith(expect.objectContaining({
      top: 282,
      behavior: "smooth",
    }));
  });

  it("does not apply keyboard scrolling on desktop width", () => {
    mockMobileViewport({ widthMatches: false });

    render(
      <AuthLayout title="Welcome back">
        <input aria-label="Password" type="password" />
      </AuthLayout>
    );

    const shell = document.querySelector("[data-auth-layout]");
    const password = screen.getByLabelText("Password");
    shell.scrollBy = vi.fn();
    password.scrollIntoView = vi.fn();
    password.getBoundingClientRect = vi.fn(() => ({
      top: 690,
      bottom: 738,
      left: 0,
      right: 320,
      width: 320,
      height: 48,
      x: 0,
      y: 690,
      toJSON: () => ({}),
    }));

    password.focus();
    fireEvent.focusIn(password);
    vi.runOnlyPendingTimers();

    expect(shell.style.getPropertyValue("--auth-keyboard-offset")).toBe("0px");
    expect(shell.scrollBy).not.toHaveBeenCalled();
  });
});
