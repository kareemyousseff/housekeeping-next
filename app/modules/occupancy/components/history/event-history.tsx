import { getEventHistory } from "../../event-history-getter";
import EventHistoryList from "./event-history-list";

export default async function EventHistory({ familyId }: { familyId: string }) {
  const { events, hasMore } = await getEventHistory(familyId);
  return (
    <EventHistoryList
      familyId={familyId}
      initialEvents={events}
      initialHasMore={hasMore}
    />
  );
}
