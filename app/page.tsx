import GlobeScene from "./components/GlobeScene";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-gray-400">
      <GlobeScene />
      <div className="pointer-events-none absolute bottom-4 left-4 text-xs font-normal">
        © Vishnu Bharath 2026
      </div>
    </div>
  );
}
