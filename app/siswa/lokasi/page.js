import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LokasiPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const location = {
    name: 'Perpustakaan SMK Taruna Bhakti',
    address: 'Jl. Pekapuran, RT.02/RW.06, Curug, Kec. Cimanggis, Kota Depok, Jawa Barat 16953',
    phone: '(021) 3456789',
    hours: '08:00 - 20:00 WIB',
    facilities: ['WiFi Gratis', 'Ruang Baca', 'Area Diskusi', 'Kafe', 'Lab Komputer', 'Ruang Meeting']
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 animate-fade-in transition-colors duration-300">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lokasi Perpustakaan</h1>
        <p className="text-gray-600 dark:text-gray-400">Temukan lokasi perpustakaan kami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Info Card */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{location.name}</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-xl mt-0.5">📍</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Alamat</p>
                <p className="text-gray-700 dark:text-gray-300">{location.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Telepon</p>
                <p className="text-gray-700 dark:text-gray-300">{location.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Jam Operasional</p>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">{location.hours}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white mb-3">Fasilitas:</p>
              <div className="flex flex-wrap gap-2">
                {location.facilities.map((facility, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span>🗺️</span>
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all animate-fade-in">
          <div className="h-full min-h-[500px]">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(location.address)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full rounded-xl"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

