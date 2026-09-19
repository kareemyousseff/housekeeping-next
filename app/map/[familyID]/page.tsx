import Link from "next/link";
import Map from "../../modules/occupancy/components/map";
import { getOccupancy } from "../../modules/occupancy/occupancy.server";
import EventHistory from "../../modules/occupancy/components/history";
import EventListener from "./eventlistener";
import Card from "../../components/card";
import MapLayout from "../../components/map-layout";

export default async function MapPage({
    params,
}: {
    params: Promise<{ familyID: string }>;
}) {
    const { familyID } = await params;
    const occupancy = await getOccupancy(familyID);

    if (!occupancy.hasFamily) {
        return (
            <Card>
                <h1>Map Page</h1>
                <p>You are not a member of this family.</p>
                <Link href="/families">Back to families</Link>
            </Card>
        );
    }

    return (
        <MapLayout
            title="Map Page"
            live={<EventListener familyID={familyID} />}
            history={<EventHistory familyId={familyID} />}
            map={<Map occupancy={occupancy} familyId={familyID} />}
        />
    );
}
