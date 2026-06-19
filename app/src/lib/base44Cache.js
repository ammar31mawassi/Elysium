import { queryClientInstance, APP_QUERY_GC_TIME_MS, APP_QUERY_STALE_TIME_MS } from "@/lib/query-client";

export function getCachedQueryData(queryKey) {
  return queryClientInstance.getQueryData(queryKey);
}

export function isCachedQueryFresh(queryKey, staleTime = APP_QUERY_STALE_TIME_MS) {
  const state = queryClientInstance.getQueryState(queryKey);
  if (!state?.dataUpdatedAt || state.isInvalidated) return false;
  return Date.now() - state.dataUpdatedAt < staleTime;
}

export function setCachedQueryData(queryKey, updater) {
  queryClientInstance.setQueryData(queryKey, updater);
}

export async function loadCachedQuery({
  queryKey,
  queryFn,
  force = false,
  staleTime = APP_QUERY_STALE_TIME_MS,
  gcTime = APP_QUERY_GC_TIME_MS,
  retry = false,
}) {
  if (force) {
    await queryClientInstance.invalidateQueries({ queryKey, exact: true });
  }
  return queryClientInstance.fetchQuery({ queryKey, queryFn, staleTime, gcTime, retry });
}

export function mergeRecordsById(records = [], nextRecords = []) {
  const byId = new Map();
  [...records, ...nextRecords].filter(Boolean).forEach((record) => {
    if (record?.id) byId.set(record.id, record);
  });
  return Array.from(byId.values());
}

export function removeRecordsById(records = [], ids = []) {
  const idSet = new Set(ids.filter(Boolean));
  return records.filter((record) => !idSet.has(record.id));
}

function prependRecord(records = [], record) {
  if (!record?.id) return records;
  return [record, ...records.filter((item) => item.id !== record.id)];
}

export function invalidateAppDataCaches() {
  [
    ["dashboard"],
    ["calendar-page"],
    ["discover-tab"],
    ["my-communities"],
    ["tools-resources"],
    ["profile-page"],
    ["flashcards"],
  ].forEach((queryKey) => {
    queryClientInstance.invalidateQueries({ queryKey });
  });
}

export function patchCreatedActionCaches(detail) {
  if (!detail) return;

  if (detail.calendarItem) {
    queryClientInstance.setQueriesData({ queryKey: ["calendar-page"] }, (current = []) => mergeRecordsById(current, [detail.calendarItem]));
  }

  queryClientInstance.setQueriesData({ queryKey: ["dashboard"] }, (current) => {
    if (!current) return current;
    return {
      ...current,
      calendar: detail.calendarItem ? mergeRecordsById(current.calendar, [detail.calendarItem]) : current.calendar,
      events: detail.type === "social" && detail.event ? prependRecord(current.events, detail.event) : current.events,
      eventMembers: detail.type === "social" && detail.membership ? mergeRecordsById(current.eventMembers, [detail.membership]) : current.eventMembers,
      sessions: detail.type === "study" && detail.session ? prependRecord(current.sessions, detail.session) : current.sessions,
      sessionMembers: detail.type === "study" && detail.membership ? mergeRecordsById(current.sessionMembers, [detail.membership]) : current.sessionMembers,
    };
  });

  queryClientInstance.setQueriesData({ queryKey: ["discover-tab"] }, (current) => {
    if (!current) return current;
    return {
      ...current,
      calendarItems: detail.calendarItem ? mergeRecordsById(current.calendarItems, [detail.calendarItem]) : current.calendarItems,
      events: detail.type === "social" && detail.event ? prependRecord(current.events, detail.event) : current.events,
      eventMembers: detail.type === "social" && detail.membership ? mergeRecordsById(current.eventMembers, [detail.membership]) : current.eventMembers,
      sessions: detail.type === "study" && detail.session ? prependRecord(current.sessions, detail.session) : current.sessions,
      sessionMembers: detail.type === "study" && detail.membership ? mergeRecordsById(current.sessionMembers, [detail.membership]) : current.sessionMembers,
    };
  });

  queryClientInstance.setQueriesData({ queryKey: ["my-communities"] }, (current) => {
    if (!current) return current;
    return {
      ...current,
      events: detail.type === "social" && detail.event ? prependRecord(current.events, detail.event) : current.events,
      eventMembers: detail.type === "social" && detail.membership ? mergeRecordsById(current.eventMembers, [detail.membership]) : current.eventMembers,
      sessions: detail.type === "study" && detail.session ? prependRecord(current.sessions, detail.session) : current.sessions,
      sessionMembers: detail.type === "study" && detail.membership ? mergeRecordsById(current.sessionMembers, [detail.membership]) : current.sessionMembers,
    };
  });

  invalidateAppDataCaches();
}
