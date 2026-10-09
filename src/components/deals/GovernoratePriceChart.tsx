import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { SoldTransaction } from '../../types/listing.ts';
import { BarChart3, TrendingUp, Filter, DollarSign } from 'lucide-react';

interface GovernoratePriceChartProps {
  deals: SoldTransaction[];
}

interface ChartItem {
  governorate: string;
  avgPricePerFeddan: number;
  dealsCount: number;
  totalArea: number;
  totalVolume: number;
}

const BAR_COLORS = [
  '#166534',
  '#15803d',
  '#0284c7',
  '#0369a1',
  '#0d9488',
  '#059669',
  '#ca8a04',
  '#d97706',
];

export const GovernoratePriceChart: React.FC<GovernoratePriceChartProps> = ({ deals }) => {
  const [metric, setMetric] = useState<'price' | 'volume'>('price');

  const chartData: ChartItem[] = useMemo(() => {
    const map = new Map<
      string,
      { totalPrice: number; totalArea: number; count: number; prices: number[] }
    >();

    deals.forEach((deal) => {
      const gov = deal.governorate;
      const current = map.get(gov) || {
        totalPrice: 0,
        totalArea: 0,
        count: 0,
        prices: [],
      };
      current.totalPrice += deal.soldPrice;
      current.totalArea += deal.areaFeddan;
      current.count += 1;
      current.prices.push(deal.soldPricePerFeddan);
      map.set(gov, current);
    });

    const items: ChartItem[] = Array.from(map.entries()).map(([gov, data]) => {
      const avgPrice = Math.round(
        data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length
      );
      return {
        governorate: gov,
        avgPricePerFeddan: avgPrice,
        dealsCount: data.count,
        totalArea: data.totalArea,
        totalVolume: data.totalPrice,
      };
    });

    // Default sort by price descending
    items.sort((a, b) =>
      metric === 'price'
        ? b.avgPricePerFeddan - a.avgPricePerFeddan
        : b.totalVolume - a.totalVolume
    );

    return items;
  }, [deals, metric]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: ChartItem = payload[0].payload;
      return (
        <div
          className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#bbf7d0] shadow-xl text-right text-xs space-y-1.5"
          dir="rtl"
        >
          <div className="font-black text-sm text-[#14281d] border-b border-[#edf3ef] pb-1">
            محافظة {data.governorate}
          </div>
          <div className="text-[#166534] font-bold">
            متوسط سعر الفدان الفعلي:{' '}
            <span className="font-extrabold font-sans text-sm">
              {data.avgPricePerFeddan.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <div className="text-[#527963]">
            عدد الصفقات المنفذة:{' '}
            <strong className="text-[#14281d]">{data.dealsCount} صفقات</strong>
          </div>
          <div className="text-[#527963]">
            إجمالي المساحة المتداولة:{' '}
            <strong className="text-[#14281d]">{data.totalArea} فدان</strong>
          </div>
          <div className="text-[#6b7280] text-[10px] pt-0.5">
            إجمالي حجم التداول: {data.totalVolume.toLocaleString('ar-EG')} ج.م
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf3ef] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
              <BarChart3 className="w-4 h-4 text-[#16a34a]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#14281d]">
                مؤشر متوسط أسعار الأراضي حسب المحافظة
              </h3>
              <p className="text-xs text-[#527963]">
                تحليل بياني تفاعلي مستند إلى أسعار الصفقات المنفذة فعلياً بالفدان (Recharts)
              </p>
            </div>
          </div>
        </div>

        {/* Metric Switch */}
        <div className="flex items-center gap-1.5 bg-[#f7faf8] p-1 rounded-xl border border-[#e2eae5] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'price'
                ? 'bg-[#166534] text-white shadow-2xs'
                : 'text-[#4b6354] hover:text-[#166534]'
            }`}
          >
            متوسط سعر الفدان
          </button>
          <button
            type="button"
            onClick={() => setMetric('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'volume'
                ? 'bg-[#166534] text-white shadow-2xs'
                : 'text-[#4b6354] hover:text-[#166534]'
            }`}
          >
            حجم التداول المالي
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf3ef" />
            <XAxis
              dataKey="governorate"
              tick={{ fill: '#374151', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: '#e2eae5' }}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : `${val}`
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4', opacity: 0.6 }} />
            <Bar
              dataKey={metric === 'price' ? 'avgPricePerFeddan' : 'totalVolume'}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Key Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#edf3ef] text-right text-xs">
        <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
          <span className="text-[10px] text-[#6b7280] block">المحافظة الأعلى سعراً:</span>
          <span className="font-extrabold text-[#166534]">
            {chartData[0]?.governorate} ({chartData[0]?.avgPricePerFeddan.toLocaleString('ar-EG')} ج.م)
          </span>
        </div>
        <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
          <span className="text-[10px] text-[#6b7280] block">المحافظة الأنسب استصلاحاً:</span>
          <span className="font-extrabold text-[#0284c7]">
            {chartData[chartData.length - 1]?.governorate} ({chartData[chartData.length - 1]?.avgPricePerFeddan.toLocaleString('ar-EG')} ج.م)
          </span>
        </div>
        <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
          <span className="text-[10px] text-[#6b7280] block">إجمالي المحافظات المرصودة:</span>
          <span className="font-bold text-[#14281d]">{chartData.length} محافظات رئيسية</span>
        </div>
        <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
          <span className="text-[10px] text-[#6b7280] block">تحديث المؤشر:</span>
          <span className="font-bold text-[#16a34a]">مباشر بناءً على الصفقات الموثقة</span>
        </div>
      </div>
    </div>
  );
};
