import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function LanguageProbe() {
  const { locale, setLocale } = useLanguage();
  return <><span>{locale}</span><button onClick={() => setLocale("ar")}>Arabic</button></>;
}

describe("LanguageProvider", () => {
  it("sets document language and direction for Arabic", async () => {
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Arabic" }));
    await waitFor(() => expect(screen.getByText("ar")).toBeInTheDocument());
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(localStorage.getItem("elysium_lang")).toBe("ar");
  });
});
