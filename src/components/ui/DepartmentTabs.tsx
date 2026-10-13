import React from 'react';
import { DepartmentId } from '../../types/store';
import { Shirt, Layers, Footprints, Compass } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface DepartmentTabsProps {
  activeDepartment: DepartmentId;
  onSelectDepartment: (dept: DepartmentId) => void;
}

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  activeDepartment,
  onSelectDepartment
}) => {
  const tabs: { id: DepartmentId; label: string; icon: React.ReactNode }[] = [
    { id: 'clothing', label: 'Clothing', icon: <Shirt className="w-3.5 h-3.5" /> },
    { id: 'caps', label: 'Caps', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'shoes', label: 'Shoes', icon: <Footprints className="w-3.5 h-3.5" /> },
    { id: 'all', label: '360° View', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeDepartment === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick(750);
                onSelectDepartment(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-yellow-400 text-neutral-950 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
