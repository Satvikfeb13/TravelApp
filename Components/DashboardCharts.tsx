import React, { useMemo } from 'react';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, ColumnSeries, SplineAreaSeries, Category, Tooltip, Legend } from '@syncfusion/ej2-react-charts';

const DashboardCharts = ({ users, trips }: { users?: any[], trips?: any[] }) => {
    
    // Process User Growth dynamically from data or use mock fallback
    const userGrowthData = [
        { day: "Apr 12", count: 1 },
        { day: "Apr 13", count: 3 },
        { day: "Apr 14", count: 6 },
        { day: "Apr 16", count: 4 },
        { day: "Apr 21", count: 1 },
    ];

    // Process Trip Trends dynamically from data or use mock fallback
    const tripTrendsData = [
        { style: "Adventure", count: 6 },
        { style: "Cultural", count: 3 },
        { style: "Luxury", count: 4 },
        { style: "Relaxed", count: 2 },
        { style: "Nature & Outdoors", count: 2 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* USER GROWTH CHART */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-center mb-6 text-dark-100">User Growth</h2>
                <ChartComponent 
                    id="user-growth-chart" 
                    primaryXAxis={{ valueType: 'Category', majorGridLines: { width: 0 }, title: 'Day' }} 
                    primaryYAxis={{ minimum: 0, maximum: 10, interval: 2, title: 'Count', lineStyle: { width: 0 } }} 
                    tooltip={{ enable: true }}
                    legendSettings={{ visible: false }}
                    chartArea={{ border: { width: 0 } }}
                    height="350px"
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, Tooltip, Legend]} />
                    <SeriesCollectionDirective>
                        <SeriesDirective 
                            dataSource={userGrowthData} 
                            xName="day" 
                            yName="count" 
                            name="Signups" 
                            type="SplineArea"
                            fill="#bfdbfe" 
                            opacity={0.5}
                            border={{ width: 2, color: '#3b82f6' }}
                        />
                        <SeriesDirective 
                            dataSource={userGrowthData} 
                            xName="day" 
                            yName="count" 
                            name="Signups" 
                            type="Column" 
                            fill="#3b82f6" 
                            columnWidth={0.2}
                            cornerRadius={{ topLeft: 4, topRight: 4 }}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
                <div className="mt-4"><p className="text-sm font-semibold text-gray-700">Latest user signups</p></div>
            </div>

            {/* TRIP TRENDS CHART */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-center mb-6 text-dark-100">Trip Trends</h2>
                <ChartComponent 
                    id="trip-trends-chart" 
                    primaryXAxis={{ valueType: 'Category', majorGridLines: { width: 0 }, title: 'Travel Styles' }} 
                    primaryYAxis={{ minimum: 0, maximum: 10, interval: 2, title: 'Count', lineStyle: { width: 0 } }} 
                    tooltip={{ enable: true }}
                    legendSettings={{ visible: false }}
                    chartArea={{ border: { width: 0 } }}
                    height="350px"
                >
                    <Inject services={[ColumnSeries, Category, Tooltip]} />
                    <SeriesCollectionDirective>
                        <SeriesDirective 
                            dataSource={tripTrendsData} 
                            xName="style" 
                            yName="count" 
                            name="Trips" 
                            type="Column" 
                            fill="#4f46e5" // indigo tailwind
                            columnWidth={0.3}
                            cornerRadius={{ topLeft: 4, topRight: 4 }}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
                <div className="mt-4"><p className="text-sm font-semibold text-gray-700">Trips based on interest</p></div>
            </div>

        </div>
    );
};

export default DashboardCharts;
