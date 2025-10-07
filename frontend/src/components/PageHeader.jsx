import React from 'react';

const PageHeader = ({ title, subtitle, children }) => {
  return (
    // Removed fixed background (bg-white) and border so the wrapping component (CitizenDashboard) controls the card styling.
    <div className="w-full">
      <div className="py-2"> {/* Reduced vertical padding as the outer wrapper provides p-6 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            {/* Dark mode text colors applied */}
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              // Dark mode text colors applied
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>
            )}
          </div>
          {children && (
            <div className="flex-shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
