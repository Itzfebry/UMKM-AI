import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveBusiness } from "@/server/lib/access";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk");
  const business = await getActiveBusiness(session.user.id);
  redirect(business ? "/beranda" : "/onboarding");
}