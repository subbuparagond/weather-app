'use client';

import { Link } from "@remix-run/react";

function WeatherDashboardHeader() {
  return (
    <div>
   
      <div className="fixed z-50 flex items-center justify-between w-full px-4 py-0 shadow lg:hidden bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-start">
          <Link href="/home" className="flex items-center justify-start p-4">
            <span className="self-center text-xl font-semibold tracking-wide whitespace-nowrap text-slate-800 dark:text-white">
              WeatherApp
            </span>
          </Link>
        </div>
      </div>
   

    
      <div className="fixed w-full top-0 z-50 hidden py-4 mx-auto border border-t-0 shadow-sm border-slate-50 dark:border-slate-900 border-x-0 backdrop-filter backdrop-blur-lg bg-opacity-30 lg:block md:px-4 xl:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-semibold tracking-wide text-slate-800 dark:text-white animate-gradient-x">
                WeatherApp
              </span>
            </Link>
          </div>
       
        </div>
      </div>

    </div>
  );
}

export default WeatherDashboardHeader;
