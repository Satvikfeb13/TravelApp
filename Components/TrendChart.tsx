import React from 'react';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, ColumnSeries, Category, Tooltip, Legend, DataLabel } from '@syncfusion/ej2-react-charts';
import { chartOneData } from '~/constants';

const TrendChart = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-dark-100">Analytics Overview</h2>
            <ChartComponent 
                id="analytics-chart" 
                primaryXAxis={{ valueType: 'Category', majorGridLines: { width: 0 } }} 
                primaryYAxis={{ lineStyle: { width: 0 }, majorTickLines: { width: 0 }, labelFormat: '{value}k' }} 
                tooltip={{ enable: true }}
                legendSettings={{ visible: true }}
                chartArea={{ border: { width: 0 } }}
                height="350px"
            >
                <Inject services={[ColumnSeries, Category, Tooltip, Legend, DataLabel]} />
                <SeriesCollectionDirective>
                    <SeriesDirective 
                        dataSource={chartOneData} 
                        xName="x" 
                        yName="y1" 
                        name="Users Generated" 
                        type="Column" 
                        fill="#bb3240" 
                        cornerRadius={{ topLeft: 4, topRight: 4 }}
                    />
                    <SeriesDirective 
                        dataSource={chartOneData} 
                        xName="x" 
                        yName="y2" 
                        name="Trips Created" 
                        type="Column" 
                        fill="#ffd60a" 
                        cornerRadius={{ topLeft: 4, topRight: 4 }}
                    />
                </SeriesCollectionDirective>
            </ChartComponent>
        </div>
    );
};

export default TrendChart;
