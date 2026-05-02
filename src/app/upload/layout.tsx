import Navbar from "@/components/navbar";

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 bg-black border-b border-zinc-800 px-6 py-4 z-40">
        <h1 className="text-xl font-black text-amber-400">Split the G</h1>
      </header>
      {children}
      <Navbar />
    </>
  );
}
