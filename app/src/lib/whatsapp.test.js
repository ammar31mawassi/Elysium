import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "./whatsapp";

describe("WhatsApp helpers", () => {
  it("normalizes an Israeli mobile number", () => {
    expect(normalizeWhatsAppNumber("054-123-4567")).toBe("972541234567");
  });

  it("builds an encoded WhatsApp link", () => {
    expect(buildWhatsAppUrl("+972 54 123 4567", "Hi from Elysium")).toBe("https://wa.me/972541234567?text=Hi%20from%20Elysium");
  });
});

