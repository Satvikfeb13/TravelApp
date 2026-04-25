import { redirect } from "react-router";
import { account } from "~/appwrite/client";

export async function clientLoader() {
    try {
        const user = await account.get();
        if (user) {
            return redirect("/dashboard");
        }
    } catch (error) {
        // user is not logged in / error getting user
    }
    return redirect("/sign-in");
}

export default function Index() {
    return null;
}
