import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("nzhis-session");
  
  if (session) {
    redirect("/patients");
  } else {
    redirect("/login");
  }
}
