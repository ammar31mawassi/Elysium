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
});
