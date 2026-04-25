import {appWriteConfig, database} from "~/appwrite/client";
import {Query} from "appwrite";

export const getAllTrips = async (limit: number, offset: number) => {
    const allTrips = await database.listDocuments(
        appWriteConfig.dataBaseId,
        appWriteConfig.tripsCollectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
    )

    if(allTrips.total === 0) {
        console.error('No trips found');
        return { allTrips: [], total: 0 }
    }

    return {
        allTrips: allTrips.documents,
        total: allTrips.total,
    }
}

export const getTripById = async (tripId: string) => {
    const trip = await database.getDocument(
        appWriteConfig.dataBaseId,
        appWriteConfig.tripsCollectionId,
        tripId
    );

    if(!trip.$id) {
        console.log('Trip not found')
        return null;
    }

    return trip;
}

export const deleteTripById = async (tripId: string) => {
    return await database.deleteDocument(
        appWriteConfig.dataBaseId,
        appWriteConfig.tripsCollectionId,
        tripId
    );
}

export const updateTripById = async (tripId: string, updatedData: any) => {
    return await database.updateDocument(
        appWriteConfig.dataBaseId,
        appWriteConfig.tripsCollectionId,
        tripId,
        updatedData
    );
}