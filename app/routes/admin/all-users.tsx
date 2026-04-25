import React from 'react'
import { Header } from '../../../Components'
import { ColumnsDirective, ColumnDirective, GridComponent } from '@syncfusion/ej2-react-grids'
import { cn, formatDate } from '~/lib/utils'
import { getAllUsers } from "~/appwrite/auth"
import { getAllTrips } from "~/appwrite/trips"
import type { Route } from "./+types/all-users"

export const loader = async () => {
    try {
        const [usersResponse, tripsResponse] = await Promise.all([
            getAllUsers(20, 0),
            getAllTrips(100, 0)
        ]);

        const tripCounts: Record<string, number> = {};
        
        tripsResponse?.allTrips?.forEach((trip: any) => {
            if (trip.userId) {
                tripCounts[trip.userId] = (tripCounts[trip.userId] || 0) + 1;
            }
        });

        const mergedUsers = usersResponse.users.map((user: any) => ({
            ...user,
            itineraryCreated: tripCounts[user.accountId] || 0
        }));

        return { users: mergedUsers, total: usersResponse.total }
    } catch (error) {
        console.error("❌ Loader error:", error)
        return { users: [], total: 0 }
    }
}

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users } = loaderData

   
    if (!Array.isArray(users)) {
        console.error("❌ Users is NOT an array:", users)
        return <div>Invalid data format</div>
    }

    return (
        <main className='all-users wrapper'>
            <Header
                title="Manage Users"
                description="Filter, Sort, access detailed user profiles"
            />

            <GridComponent dataSource={users}>
                <ColumnsDirective>
                <ColumnDirective
                        field="name"
                        headerText="Name"
                        width="200"
                        textAlign="Left"
                        template={(props: UserData) => (
                            <div className="flex items-center gap-1.5 px-4">
        <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                <span>{props.name}</span>
                            </div>
                        )}
                    />

                    {/* ✅ EMAIL */}
                    <ColumnDirective
                        field="email"
                        headerText="Email"
                        width='150'
                        textAlign="Left"
                    />

                    {/* ✅ DATE */}
                    <ColumnDirective
                        field="jointedAt"
                        headerText="Date Joined"
                        width='120'
                        textAlign="Left"
                        template={(props: UserData) => {

                            return props?.dateJoined
                                ? formatDate(props.dateJoined)
                                : "N/A"
                        }}
                    />

                    {/* ✅ TRIPS GENERATED */}
                    <ColumnDirective
                        field="itineraryCreated"
                        headerText="Trips Generated"
                        width='140'
                        textAlign="Center"
                        template={(props: UserData) => {
                            return (
                                <div className="font-semibold text-primary-500 bg-primary-50 px-2 py-1 rounded-lg inline-block text-center min-w-[30px]">
                                    {props?.itineraryCreated || 0}
                                </div>
                            )
                        }}
                    />

                    {/* ✅ STATUS */}
                    <ColumnDirective
                        field="status"
                        headerText="Type"
                        width='100'
                        textAlign="Left"
                        template={(props: UserData) => {

                            const status = props?.status || "unknown"

                            return (
                                <article className={cn(
                                    'status-column',
                                    status === 'user'
                                        ? 'bg-success-50'
                                        : 'bg-light-300'
                                )}>
                                    <div className={cn(
                                        'size-1.5 rounded-full',
                                        status === 'user'
                                            ? 'bg-success-500'
                                            : 'bg-gray-500'
                                    )} />
                                    <h3 className={cn(
                                        'font-inter text-xs font-medium',
                                        status === 'user'
                                            ? 'text-success-700'
                                            : 'text-gray-500'
                                    )}>
                                        {status}
                                    </h3>
                                </article>
                            )
                        }}
                    />

                </ColumnsDirective>
            </GridComponent>
        </main>
    )
}

export default AllUsers