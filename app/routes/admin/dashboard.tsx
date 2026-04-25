import React from 'react'
import { Header, StatsCard, TripCard, DashboardCharts } from '../../../Components'
import { dashboardStats, user, users as mockedUsers } from '~/constants';
import { getUser, getAllUsers } from '~/appwrite/auth';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } = dashboardStats;
import type { Route } from './+types/dashboard';

export async function clientLoader() {
    const user = await getUser();
    const tripData = await getAllTrips(20, 0); 
    const usersData = await getAllUsers(20, 0); 

    return { user, allTrips: tripData.allTrips, allUsers: usersData.users };
}

const dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { user, allTrips, allUsers } = loaderData as { user: any; allTrips: any[]; allUsers: any[] };

    return (    
        <main className='dashboard wrapper'>
            <Header
                title={`Welcome ${user?.name?.split(' ')[0] ?? 'Guest'} 👋 `}
                description="Track activity, trends and popular destinations in real time"
            />
            
            <section className='flex flex-col gap-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <StatsCard
                        headerTitle="Total Users"
                        total={totalUsers}
                        currentMonthCount={usersJoined.currentMonth}
                        lastMonthCount={usersJoined.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={totalTrips}
                        currentMonthCount={tripsCreated.currentMonth}
                        lastMonthCount={tripsCreated.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Active Users"
                        total={userRole.total}
                        currentMonthCount={userRole.currentMonth}
                        lastMonthCount={userRole.lastMonth}
                    />
                </div>
            </section>
            
            <section className="container mt-8">
                <DashboardCharts users={allUsers} trips={allTrips} />
            </section>

            <section className="container mt-8">
                <h1 className="text-xl font-semibold text-dark-100 mb-6">Created Trips</h1>

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
                        <p className="text-gray-500">No trips created yet. Click "Trips" to create one!</p>
                    )}
                </div>
            </section>

        </main>
    )
}

export default dashboard