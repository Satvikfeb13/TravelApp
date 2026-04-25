import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appWriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appWriteConfig.dataBaseId,
            appWriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();

    // try to get Google access token
    const session = await account.getSession("current");
    const accessToken = session?.providerAccessToken;

    let profilePicture = null;

    // try Google API
    if (accessToken) {
      profilePicture = await getGooglePicture(accessToken);
    }

    // fallback if Google fails
    if (!profilePicture) {
      profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
    }

    const createdUser = await database.createDocument(
      appWriteConfig.dataBaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: profilePicture,
        jointedAt: new Date().toISOString(),
      }
    );

    return createdUser;

  } catch (error) {
    console.error("ERROR IN storeUserData:", error);
    return null;
  }
};
const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

export const loginWithGoogle = async () => {
    try {
        console.log("ENDPOINT:", import.meta.env.VITE_APPWRITE_API_ENDPOINT);
        account.createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/dashboard`,
            `${window.location.origin}/sign-in`
        );
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect("/sign-in");

        const { documents } = await database.listDocuments(
            appWriteConfig.dataBaseId,
            appWriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id)
            ]
        );

        return documents.length > 0 ? documents[0] : redirect("/sign-in");
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents, total } = await database.listDocuments(
            appWriteConfig.dataBaseId,
            appWriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        );
        // ✅ NORMALIZE DATA HERE
        const users = documents.map((user: any) => ({
            accountId: user.accountId,
            name: user.name || "No Name",
            email: user.email || "No Email",
            imageUrl: user.imageUrl || "/default-avatar.png",
            dateJoined: user.jointedAt || null, // ✅ FIXED HERE
            itineraryCreated: user.itineraryCreated || 0,
            status: user.status || "user",
        }));


        return { users, total };

    } catch (e) {
        console.error('❌ Error fetching users:', e);
        return { users: [], total: 0 };
    }
};