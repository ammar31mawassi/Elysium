import { describe, expect, it } from "vitest";

const EXPECTED_APP_ID = "6a2ae3a92ace0dad0f92f1a6";
const EXPECTED_APP_BASE_URL = "https://elysium-nexus-flow.base44.app";

let importCounter = 0;

const importFreshAppParams = async (path) => {
  window.history.pushState({}, "", path);
  window.localStorage.clear();

  const module = await import(/* @vite-ignore */ `./app-params.js?test=${importCounter++}`);
  return module.appParams;
};

describe("app params", () => {
  it("has Elysium Base44 config for a clean browser session", async () => {
    const appParams = await importFreshAppParams("/login");

    expect(appParams.appId).toBe(EXPECTED_APP_ID);
    expect(appParams.appBaseUrl).toBe(EXPECTED_APP_BASE_URL);
    expect(window.localStorage.getItem("base44_app_id")).toBe(EXPECTED_APP_ID);
    expect(window.localStorage.getItem("base44_app_base_url")).toBe(EXPECTED_APP_BASE_URL);
  });

  it("ignores null-like URL values instead of storing them", async () => {
    const appParams = await importFreshAppParams("/login?app_id=null&app_base_url=undefined");

    expect(appParams.appId).toBe(EXPECTED_APP_ID);
    expect(appParams.appBaseUrl).toBe(EXPECTED_APP_BASE_URL);
    expect(window.localStorage.getItem("base44_app_id")).toBe(EXPECTED_APP_ID);
    expect(window.localStorage.getItem("base44_app_base_url")).toBe(EXPECTED_APP_BASE_URL);
  });

  it("ignores external domains passed by wrapper pages", async () => {
    const appParams = await importFreshAppParams("/login?app_id=bad-app&app_base_url=https%3A%2F%2Fhub02.com&from_url=https%3A%2F%2Fhub02.com%2Ftools%2Felysium");

    expect(appParams.appId).toBe(EXPECTED_APP_ID);
    expect(appParams.appBaseUrl).toBe(EXPECTED_APP_BASE_URL);
    expect(appParams.fromUrl).toBe(EXPECTED_APP_BASE_URL);
    expect(window.localStorage.getItem("base44_app_id")).toBe(EXPECTED_APP_ID);
    expect(window.localStorage.getItem("base44_app_base_url")).toBe(EXPECTED_APP_BASE_URL);
    expect(window.localStorage.getItem("base44_from_url")).toBe(EXPECTED_APP_BASE_URL);
  });

  it("builds canonical app URLs for auth redirects", async () => {
    await importFreshAppParams("/login");
    const { buildCanonicalAppUrl } = await import(/* @vite-ignore */ `./app-params.js?test=${importCounter++}`);

    expect(buildCanonicalAppUrl("/profile?tab=account")).toBe(`${EXPECTED_APP_BASE_URL}/profile?tab=account`);
    expect(buildCanonicalAppUrl("https://hub02.com/tools/elysium")).toBe(EXPECTED_APP_BASE_URL);
  });
});
