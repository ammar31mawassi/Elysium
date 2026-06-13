import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { preference, resolvedTheme, setTheme } = useTheme();
  return <><span>{preference}:{resolvedTheme}</span><button onClick={() => setTheme("light")}>Light</button></>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("defaults to the system theme and persists an explicit choice", async () => {
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("system:dark")).toBeInTheDocument());
    expect(document.documentElement).toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    await waitFor(() => expect(screen.getByText("light:light")).toBeInTheDocument());
    expect(localStorage.getItem("elysium-theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
