export default function BookDescription({ description }) {
  if (!description) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Deskripsi</span>
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm transition-colors duration-300">
        {description}
      </p>
    </div>
  );
}

