import { healthCheck } from "@/lib/api";

export default async function AdminHome() {
  const data = await healthCheck();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">ANEX Admin Dashboard</h1>

        <p className="text-green-400 text-xl">
          {data.message}
        </p>
      </div>
    </main>
  );
}