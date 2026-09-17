import Link from "next/link";
import Map from "../../modules/occupancy/components/map";
import { getOccupancy } from "../../modules/occupancy/occupancy.server";
import EventHistory from "../../modules/occupancy/components/history";
import EventListener from "./eventlistener";

export default async function MapPage({
    params,
}: {
    params: Promise<{ familyID: string }>;
}) {
    const { familyID } = await params;
    const occupancy = await getOccupancy(familyID);

    if (!occupancy.hasFamily) {
        return (
            <div>
                <h1>Map Page</h1>
                <p>You are not a member of this family.</p>
                <Link href="/families">Back to families</Link>
            </div>
        );
    }

    return (
        <div>
            <EventListener familyID={familyID} />
            <EventHistory familyId={familyID} />
            <h1>Map Page</h1>
            <Map occupancy={occupancy} familyId={familyID} />
        </div>
    );
}
