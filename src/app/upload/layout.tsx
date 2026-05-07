import Navbar from "@/components/navbar";

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 bg-stout/90 backdrop-blur border-b border-malt px-6 py-4 z-40">
        <h1 className="text-xl font-bold text-cream tracking-tight">Split the G</h1>
      </header>
      {children}
      <Navbar />
    </>
  );
}
