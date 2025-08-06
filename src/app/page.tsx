import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Próximamente
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Estamos preparando algo increíble para ti
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/app"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Ir a la App
          </Link>
          
          <Link
            href="/admin"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Panel de Administración
          </Link>
        </div>
      </div>
    </div>
  );
}
