import { checkUser } from "@/lib/checkUser";
import { UserButton } from "@clerk/nextjs";

export default async function Navbar() {
  const user = await checkUser();
  return (
    <div className="flex justify-between items-center p-4">
      <h1 className="text-2xl font-bold">Expense Tracker</h1>
      <UserButton />
    </div>
  );
}