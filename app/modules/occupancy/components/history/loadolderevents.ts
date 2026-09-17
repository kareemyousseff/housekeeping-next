"use server";

import { getEventHistory } from "../../event-history-getter";

export async function loadOlderEvents(
  familyId: string,
  startedAt: Date | string,
  id: string,
) {
  return getEventHistory(familyId, {
    startedAt: new Date(startedAt),
    id,
  });
}
