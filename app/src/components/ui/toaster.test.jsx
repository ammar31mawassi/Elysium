import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";

describe("Toaster", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dismisses notifications with the close button and fades before removal", () => {
    vi.useFakeTimers();
    render(<Toaster />);

    act(() => {
      toast({ title: "Peer Helper is on" });
    });

    const toastMessage = screen.getByText("Peer Helper is on").closest("[data-state]");
    expect(toastMessage).toHaveAttribute("data-state", "open");

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(toastMessage).toHaveAttribute("data-state", "closed");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByText("Peer Helper is on")).not.toBeInTheDocument();
  });

  it("auto-dismisses notifications after their duration and fades before removal", () => {
    vi.useFakeTimers();
    render(<Toaster />);

    act(() => {
      toast({ title: "Peer Helper is on", duration: 5000 });
    });

    const toastMessage = screen.getByText("Peer Helper is on").closest("[data-state]");
    expect(toastMessage).toHaveAttribute("data-state", "open");

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(toastMessage).toHaveAttribute("data-state", "open");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(toastMessage).toHaveAttribute("data-state", "closed");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByText("Peer Helper is on")).not.toBeInTheDocument();
  });
});
