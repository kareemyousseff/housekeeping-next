"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setRoomOccupancy } from "../../occupancy.actions";

const OCCUPANCY_ERRORS: Record<string, string> = {
  NOT_A_MEMBER: "You are not a member of this family.",
  NOT_IN_ROOM: "You are not in this room.",
};

export default function Bathroom({ familyId, isOccupied, isUserOccupying, hasFamily, occupants }: {
  familyId: string;
  isOccupied: boolean;
  isUserOccupying: boolean;
  hasFamily: boolean;
  occupants: string[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOccupancy = async () => {
    setError(null);
    setIsLoading(true);

    const result = await setRoomOccupancy(familyId, "bathroom", !isUserOccupying);

    if (!result.ok) {
      setError(OCCUPANCY_ERRORS[result.error] ?? "Something went wrong.");
      setIsLoading(false);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setIsLoading(false);
  };

  return (
    <div>
      <div className="room-label">Bathroom</div>
      <div className="status">Status: {isOccupied ? "Occupied" : "Available"}</div>
      {occupants.length > 0 && (
        <div className="occupants">
          {occupants.join(", ")}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <button className="occupy-btn" onClick={toggleOccupancy} disabled={!hasFamily || isLoading}>
          {isLoading ? "Updating..." : isUserOccupying ? "Free" : "Occupy"}
        </button>
      </div>
      {error && <p style={{ marginTop: 8, color: "#c53030" }}>{error}</p>}
    </div>
  );
}
