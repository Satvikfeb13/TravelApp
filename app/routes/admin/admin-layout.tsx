import React from 'react'
import { Outlet, redirect } from 'react-router'
import {SidebarComponent} from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItem } from '../../../Components';
import { account } from '~/appwrite/client';
import { getExistingUser, storeUserData } from '~/appwrite/auth';

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) {
      return redirect("/sign-in");
    }

    let existingUser = await getExistingUser(user.$id);

    if (!existingUser) {
      console.log("Creating new user...");
      await storeUserData(); // ✅ create
      existingUser = await getExistingUser(user.$id); // ✅ fetch again
    }

    return existingUser;

  } catch (error: any) {
    console.log("Error in client loader", error);

    if (error?.code === 401) {
      return redirect("/sign-in");
    }

    return redirect("/sign-in");
  }
}
const AdminLayout = () => {
  return (
    <div className='admin-layout'>
        <div className="print:hidden">
            <MobileSidebar/>
        </div>
        <aside className='w-full max-w-[270px] hidden lg:block print:hidden'>
        <SidebarComponent width={270} enableGestures={false}>
            <NavItem/>
        </SidebarComponent>
        </aside>
        <aside className='children'>
            <Outlet/>
        </aside>
    </div>
  )
}

export default AdminLayout