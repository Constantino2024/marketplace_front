import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, TrendingUp, Clock, Package } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 rounded-xl ${stat.iconBgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 sm:w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-black ${stat.valueColor || 'text-[#1E3A5F]'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};