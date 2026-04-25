import React, { useState } from 'react'
import { Header, TripCard } from '../../../Components';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import type { Route } from './+types/trips';
import type { LoaderFunctionArgs } from "react-router";
import { useSearchParams } from 'react-router';
import { PagerComponent } from "@syncfusion/ej2-react-grids";

export async function clientLoader({ request }: LoaderFunctionArgs) {
    const limit = 8;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || "1", 10);
    const offset = (page - 1) * limit;

    const tripData = await getAllTrips(limit, offset); 
    return { allTrips: tripData.allTrips, total: tripData.total };
}

const Trips = ({ loaderData }: Route.ComponentProps) => {
    const { allTrips, total } = loaderData as { allTrips: any[], total: number };

    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1')
    const [currentPage, setCurrentPage] = useState(initialPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`
    }

    return (
        <main className='all-users wrapper'>
            <Header
                title="Trips"
                description="View and Edit AI-generated travel plans"
                ctaText="Create a trip"
                ctaUrl="/trips/create"
            />
            
            <section className="container mt-8 flex flex-col gap-10">
                <div className='trip-grid'>
                    {allTrips && allTrips.length > 0 ? (
                        allTrips.map((trip) => {
                            const parsed = parseTripData(trip.tripDetails);
                            return (
                                <TripCard
                                    key={trip.$id}
                                    id={trip.$id}
                                    name={parsed?.name ?? 'Unknown Trip'}
                                    imageUrl={trip.imageUrl?.[0] ?? ''}
                                    location={parsed?.country ?? ''}
                                    tags={[parsed?.travelStyle, parsed?.groupType].filter(Boolean)}
                                    price={parsed?.estimatedPrice ?? ''}
                                />
                            );
                        })
                    ) : (
                        <p className="text-gray-500">No trips available. Create your first trip!</p>
                    )}
                </div>

                {total > 8 && (
                    <PagerComponent
                        totalRecordsCount={total}
                        pageSize={8}
                        currentPage={currentPage}
                        click={(args: any) => handlePageChange(args.currentPage)}
                        cssClass="!mb-4"
                    />
                )}
            </section>
        </main>
    )
}

export default Trips