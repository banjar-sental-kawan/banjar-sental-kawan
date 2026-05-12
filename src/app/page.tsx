export default function Home() {
  return (
    <main className="max-w-4xl mx-auto mt-10">
      <div className="glass-panel p-8 text-center">
        {/* Balinese Greeting using the custom font */}
        <h1 className="font-balinese text-4xl mb-4 text-amber-400">
          ᬒᬦ᭄ᬲ᭄ᬯᬲ᭄ᬢ᭄ᬬᬲ᭄ᬢᬸ
        </h1>
        
        {/* Latin text using Inter */}
        <h2 className="text-3xl font-bold mb-2 tracking-wide">
          Banjar Adat Sental Kawan
        </h2>
        <p className="text-gray-300 mb-6">
          Desa Adat Ped, Nusa Penida
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="glass-panel p-4 hover:bg-white/20 transition cursor-pointer">
            <h3 className="font-semibold text-lg">Data Krama</h3>
            <p className="text-sm text-gray-400 mt-1">128 Registered Members</p>
          </div>
          <div className="glass-panel p-4 hover:bg-white/20 transition cursor-pointer">
            <h3 className="font-semibold text-lg">Keuangan</h3>
            <p className="text-sm text-gray-400 mt-1">Financial Ledger</p>
          </div>
          <div className="glass-panel p-4 hover:bg-white/20 transition cursor-pointer">
            <h3 className="font-semibold text-lg">Informasi</h3>
            <p className="text-sm text-gray-400 mt-1">Notice Board & Events</p>
          </div>
        </div>
      </div>
    </main>
  );
}