import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="main-app-footer"
      className="w-full border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 sm:py-6 mt-auto transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 tracking-wide font-normal">
          © 2026 Roni German Tovar Ibañez. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
