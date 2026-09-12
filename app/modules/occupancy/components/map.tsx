"use client";
import Bathroom from "./bathroom";
import Kitchen from "./kitchen";
import type { Occupancy, OccupancyChange } from "../occupancy.server";
import { useEffect, useState } from "react";

export default function Map({ occupancy, familyId }: { occupancy: Occupancy; familyId: string }) {
    const [live,setLive] = useState(occupancy);    
    useEffect(() => {
        const es = new EventSource(`/api/map/${familyId}/events`);
        es.onmessage = (event) => {
          if (!event.data || event.data === "hello") return;
          const change = JSON.parse(event.data) as OccupancyChange;
          if (!change.id) return;
          setLive((prev) => applyChange(prev, change));
        };
        return () => es.close();
      }, [familyId]);
      useEffect(() => {
        setLive(occupancy);
      }, [occupancy]);
    return (
        <div>
            <h1>Map</h1>

            <div className="floorplan" role="img" aria-label="2D house floor plan">
                <div
                    className={`room bathroom${live.currentUserLocation === "bathroom" ? " room-you" : ""}`}
                    aria-label="Bathroom"
                >
                    <Bathroom
                        familyId={familyId}
                        isOccupied={live.bathroom}
                        isUserOccupying={live.currentUserLocation === "bathroom"}
                        hasFamily={live.hasFamily}
                        occupants={live.bathroomOccupants}
                    />
                </div>

                <div
                    className={`room kitchen${live.currentUserLocation === "kitchen" ? " room-you" : ""}`}
                    aria-label="Kitchen"
                >
                    <Kitchen
                        familyId={familyId}
                        isOccupied={live.kitchen}
                        isUserOccupying={live.currentUserLocation === "kitchen"}
                        hasFamily={live.hasFamily}
                        occupants={live.kitchenOccupants}
                    />
                </div>

                {/* example door between hallway and kitchen */}
                <div className="door" style={{ left: '34%', top: '28%' }} aria-hidden />
            </div>
        </div>
    );
}
function applyChange(prev: Occupancy, change: OccupancyChange): Occupancy {
    const name = change.actorName;
    let bathroomOccupants = prev.bathroomOccupants.filter((n) => n !== name);
    let kitchenOccupants = prev.kitchenOccupants.filter((n) => n !== name);
  
    if (change.occupied) {
      if (change.room === "bathroom") bathroomOccupants = [...bathroomOccupants, name];
      else kitchenOccupants = [...kitchenOccupants, name];
    }
  
    return {
      ...prev,
      bathroomOccupants,
      kitchenOccupants,
      bathroom: bathroomOccupants.length > 0,
      kitchen: kitchenOccupants.length > 0,
    };
  }
