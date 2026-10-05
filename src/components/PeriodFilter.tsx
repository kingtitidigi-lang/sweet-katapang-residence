import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { NAMA_BULAN } from '../utils/formatters';

interface PeriodFilterProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number; // 0 = Semua Bulan, 1-12
  setSelectedMonth: (month: number) => void;
  availableYears?: number[];
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  availableYears,
}) => {
  const currentMonthIdx = new Date().getMonth() + 1; // 1-12
  const currentYearVal = new Date().getFullYear();
  const yearsList = availableYears || [currentYearVal - 1, currentYearVal, currentYearVal + 1];

  const handleResetToCurrent = () => {
    setSelectedYear(currentYearVal);
    setSelectedMonth(currentMonthIdx);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Selector controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs tracking-wider uppercase">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Periode:</span>
          </div>

          {/* Tahun selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            {yearsList.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${selectedYear === yr
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Bulan Selector Dropdown & Quick Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                aria-label="Pilih Bulan Periode"
                className="appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 pr-8 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value={0}>Semua Bulan (Januari - Desember)</option>
                {NAMA_BULAN.map((nama, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Bulan {idx + 1}: {nama}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick buttons for common months */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setSelectedMonth(0)}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${selectedMonth === 0
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Semua
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Active status indicator & Reset */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Periode Aktif:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {selectedMonth === 0 ? `Tahun Penuh ${selectedYear}` : `${NAMA_BULAN[selectedMonth - 1]} ${selectedYear}`}
            </span>
          </div>

          {(selectedMonth !== currentMonthIdx || selectedYear !== currentYearVal) && (
            <button
              onClick={handleResetToCurrent}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 hover:bg-slate-100 rounded transition-colors"
              title={`Kembalikan ke ${NAMA_BULAN[currentMonthIdx - 1]} ${currentYearVal}`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ke Bulan Ini</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
