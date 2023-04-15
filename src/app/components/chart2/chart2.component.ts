import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { ExcelService } from 'src/app/services/excel.service';
import { isPlatformBrowser } from '@angular/common';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { Dados, Generic } from 'src/app/interfaces/dados';
import { percentParse } from 'src/app/utils/percentData';

@Component({
  selector: 'app-chart2',
  templateUrl: './chart2.component.html',
  styleUrls: ['./chart2.component.css'],
})
export class Chart2Component implements OnInit {  
  private root!: am5.Root;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private excelService: ExcelService
  ) {}


  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  async ngOnInit(): Promise<void> {
    let data: Dados[] = [];
    await this.excelService
      .getData(percentParse)
      .then((dados) => (data = dados));

    const percent: Generic = {
      cpc_x_alo: (data[0].CPC + data[1].CPC) / (data[0].ALO + data[1].ALO),
      cpca_x_cpc: (data[0].CPCA + data[1].CPCA) / (data[0].CPC + data[1].CPC),
      promessa_x_cpca:
        (data[0].PROMESSA + data[1].PROMESSA) / (data[0].CPCA + data[1].CPCA),
    };

    // Chart code goes in here
    this.browserOnly(() => {

      const root = am5.Root.new('chartdiv2');

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panY: false,
          wheelY: 'zoomX',
          layout: root.verticalLayout,
          maxTooltipDistance: 0,
        })
      );

      // Create Y-axis
      const yAxis: any = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          extraTooltipPrecision: 1,
          min: 0,
          max: 100,
          setMinMaxPercent: true,
          strictMinMax: true,
          numberFormat: "#.00'%'",
          renderer: am5xy.AxisRendererY.new(root, {
            minGridDistance: 50,
            opposite: true,
          }),
        })
      );

      // Create X-Axis
      const xAxis: any = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: 'day', count: 1 },
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 20,
          }),
        })
      );
      xAxis.get('dateFormats')['day'] = 'MM/dd';
      xAxis.get('periodChangeDateFormats')['day'] = 'MMMM';

      function createSeries(field: string, percentual: string, name: string) {
        const series = chart.series.push(
          am5xy.SmoothedXLineSeries.new(root, {
            name: name,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: field,
            valueXField: 'date',          
            tooltip: am5.Tooltip.new(root, {}),
            legendLabelText: `% {name}  ${(percent[percentual] * 100).toFixed(
              2
            )}%`,                                    
          })
        );

        series.strokes.template.set('strokeWidth', 2);

        series.set('tooltipText', '[bold]{name}[/]: {valueY}');

        series.data.setAll(data);
      }

      createSeries('cpc_alos', 'cpc_x_alo', 'CPC x Alôs');
      createSeries('cpca_cpc', 'cpca_x_cpc', 'CPC APV x CPC');
      createSeries('promessas_cpca', 'promessa_x_cpca', 'Promessas x CPC APV');

      // Add cursor
      chart.set(
        'cursor',
        am5xy.XYCursor.new(root, {
          behavior: 'zoomXY',
          xAxis: xAxis,
        })
      );

      xAxis.set(
        'tooltip',
        am5.Tooltip.new(root, {
          themeTags: ['axis'],
        })
      );

      yAxis.set(
        'tooltip',
        am5.Tooltip.new(root, {
          themeTags: ['axis'],
        })
      );

      let legend = chart.children.push(
        am5.Legend.new(root, {
          scale: 0.7,
          centerX: am5.percent(50),
          x: am5.percent(50),
          maxWidth: 100,
          layout: root.verticalLayout 
        })
      );
      
      legend.data.setAll(chart.series.values);

      chart.set('cursor', am5xy.XYCursor.new(root, {}));

      this.root = root;
    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }
}
