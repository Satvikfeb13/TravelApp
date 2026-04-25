import {Account, Client, Databases, Storage} from "appwrite";
export const appWriteConfig = {
    endpointurl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    tripsCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION
    , userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION
    , dataBaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID
    , apiKey: import.meta.env.VITE_APPWRITE_APIKEY
    , projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID
}
const client = new Client()
    .setEndpoint(appWriteConfig.endpointurl)
    .setProject(appWriteConfig.projectId)

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { client, account, database, storage };