import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
      <Navbar />
    </>
  );
}
