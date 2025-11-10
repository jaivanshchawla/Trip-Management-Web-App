import { useExpenseData } from "@/components/hooks/useExpenseData";
import { motion } from "framer-motion";
import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statuses } from "@/utils/schema";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    party?: string;
    route?: {
        origin: string;
        destination: string;
        trips: string[]; // Ensure this is an array of trip IDs
    };
    tripIds?: string[];
};


interface Route {
    origin: string;
    destination: string;
    trips: string[];
}

const InvoiceForm: React.FC<Props> = ({ open, setOpen, party, route, tripIds }) => {
    const { parties, trips } = useExpenseData();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParty, setSelectedParty] = useState(party || "");
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(
        route
            ? {
                origin: route.origin,
                destination: route.destination,
                trips: route.trips,
            }
            : null,
    );
    const [selectedTripIds, setSelectedTripIds] = useState<string[]>(tripIds || []);

    useEffect(() => {
        if (party) {
            setSelectedParty(party);
        }
        if (route) {
            setSelectedRoute({
                origin: route.origin,
                destination: route.destination,
                trips: route.trips,
            });
        }
        if (tripIds) {
            setSelectedTripIds(tripIds);
        }
    }, [party, route, tripIds]);

    const filteredParties = parties.filter((party) =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredRoutes = useMemo(() => {
        if (!trips || trips.length === 0) return [];

        const routeMap = new Map<string, Route>();

        trips.forEach((trip) => {
            if (selectedParty && trip.party !== selectedParty) {
                return;
            }

            const routeKey = `${trip.route.origin}|${trip.route.destination}`;
            if (!routeMap.has(routeKey)) {
                routeMap.set(routeKey, {
                    origin: trip.route.origin,
                    destination: trip.route.destination,
                    trips: [],
                });
            }
            routeMap.get(routeKey)!.trips.push(trip.trip_id);
        });

        return Array.from(routeMap.values()).filter((route) => {
            if (!searchTerm) return true;

            const lowercaseSearchTerm = searchTerm.toLowerCase();
            return (
                route.origin.toLowerCase().includes(lowercaseSearchTerm) ||
                route.destination.toLowerCase()?.includes(lowercaseSearchTerm)
            );
        });
    }, [trips, selectedParty, searchTerm]);

    const tripsForSelectedRoute = useMemo(() => {
        if (route) {
            return trips.filter(
                (trip) =>
                    trip.route.origin === route.origin &&
                    trip.route.destination === route.destination
            );
        }
        if (!selectedRoute) return [];

        return trips.filter((trip) => selectedRoute.trips.includes(trip.trip_id));
    }, [selectedRoute, trips, route]);


    const handleTripSelection = (tripId: string) => {
        setSelectedTripIds((prev) =>
            prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId],
        );
    };

    if (!open) {
        return null;
    }

    return (
        <div className="modal-class">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01],
                }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[700px] overflow-y-auto thin-scrollbar"
            >
                <h2 className="text-black text-xl font-semibold">Invoice Generation</h2>
                <div className="my-2">
                    <label>Select Customer *</label>
                    <Select
                        name="party"
                        value={selectedParty}
                        onValueChange={(value) => {
                            setSelectedParty(value);
                            setSelectedRoute(null);
                            setSelectedTripIds([]);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <div className="sticky p-2 flex items-center justify-between gap-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            {filteredParties.length > 0 ? (
                                filteredParties.map((party) => (
                                    <SelectItem key={party.party_id} value={party.party_id}>
                                        {party.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-gray-500">No customers found</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {selectedParty && (
                    <div className="my-2">
                        <label>Select Route *</label>
                        <Select
                            name="route"
                            value={selectedRoute ? `${selectedRoute.origin}|${selectedRoute.destination}` : ""}
                            onValueChange={(value) => {
                                const [origin, destination] = value.split("|");
                                const route = filteredRoutes.find(
                                    (r) => r.origin === origin && r.destination === destination,
                                );
                                setSelectedRoute(route || null);
                                setSelectedTripIds([]);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Route" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <div className="sticky p-2 flex items-center justify-between gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                {filteredRoutes.length > 0 ? (
                                    filteredRoutes.map((route) => (
                                        <SelectItem
                                            key={`${route.origin}|${route.destination}`}
                                            value={`${route.origin}|${route.destination}`}
                                        >
                                            <div className="flex items-center justify-between w-full p-2 space-x-4">
                                                <span className="font-semibold text-gray-700 whitespace-nowrap">
                                                    {route.origin.split(",")[0]} &rarr; {route.destination.split(",")[0]}
                                                </span>
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {route.trips.length} trip(s)
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No routes found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {selectedRoute && (
                    <div className="my-4">
                        <h3 className="text-lg font-semibold mb-2">Select Trips</h3>
                        {tripsForSelectedRoute.map((trip) => (
                            <div key={trip.trip_id} className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id={trip.trip_id}
                                    checked={selectedTripIds.includes(trip.trip_id)}
                                    onCheckedChange={() => handleTripSelection(trip.trip_id)}
                                    disabled={trip.invoice !== false}
                                />
                                <label
                                    htmlFor={trip.trip_id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    LR: {trip.LR} | Date: {new Date(trip.startDate).toLocaleDateString()} | Status:{" "}
                                    {statuses[trip.status as number]}
                                    {trip.invoice !== false && " (Already Invoiced)"}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 justify-end">
                    <Button onClick={() => setOpen(false)} variant={"outline"}>
                        Cancel
                    </Button>
                    {selectedParty && selectedRoute && selectedTripIds.length > 0 && (
                        <Link
                            href={`/user/trips/invoice?party=${encodeURIComponent(
                                selectedParty,
                            )}&route=${encodeURIComponent(
                                JSON.stringify(selectedRoute),
                            )}&trips=${encodeURIComponent(JSON.stringify(selectedTripIds))}`}
                        >
                            <Button className="my-2">
                                <ArrowRightIcon />
                            </Button>
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InvoiceForm;