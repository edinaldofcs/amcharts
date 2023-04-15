import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { ExcelService } from 'src/app/services/excel.service';
import { isPlatformBrowser } from '@angular/common';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { Dados, Generic } from 'src/app/interfaces/dados';
import { dataParse } from 'src/app/utils/dataParse';

@Component({
  selector: 'app-chart1',
  templateUrl: './chart1.component.html',
  styleUrls: ['./chart1.component.css'],
})
export class Chart1Component implements OnInit {
  private root!: am5.Root;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private excelService: ExcelService
  ) {}

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  async ngOnInit(): Promise<void> {
    let data: Dados[] = [];
    await this.excelService.getData(dataParse).then((dados) => (data = dados));

    const COUNT = data[0].COUNT! + data[1].COUNT!;
    const mean: Generic = {
      ALO_MEAN: (data[0].ALO + data[1].ALO) / COUNT,
      CPC_MEAN: (data[0].CPC + data[1].CPC) / COUNT,
      CPCA_MEAN: (data[0].CPCA + data[1].CPCA) / COUNT,
      PROMESSA_MEAN: (data[0].PROMESSA + data[1].PROMESSA) / COUNT,
    };
   
    this.browserOnly(() => {    

      const root = am5.Root.new('chartdiv');

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
          renderer: am5xy.AxisRendererY.new(root, {
            minGridDistance: 50,
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

      // Create series
      function createSeries1(field: string) {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: field,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: field,
            valueXField: 'date',
            tooltip: am5.Tooltip.new(root, {}),
            legendLabelText: `{name} , ${mean[field + '_MEAN'].toFixed(2)}`,
          })
        );

        series.set(
          'tooltipText',
          '[bold]{name}: {valueY}'
        );

        series.set('stroke', am5.color('rgba(230,230,230,0)'));
        series.columns.template.set(
          'fillGradient',
          am5.LinearGradient.new(root, {
            stops: [
              {
                color: am5.color('rgba(230,230,230,.1)'),
              },
              {
                color: am5.color('rgba(210,210,210,1)'),
              },
              {
                color: am5.color('rgba(230,230,230,.1)'),
              },
            ],
            rotation: 90,
          })
        );
        series.data.setAll(data);
      }

      function createSeries(field: string) {
        const series = chart.series.push(
          am5xy.SmoothedXLineSeries.new(root, {
            name: field,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: field,
            valueXField: 'date',
            tooltip: am5.Tooltip.new(root, {}),
            legendLabelText: `{name} , ${mean[field + '_MEAN'].toFixed(2)}`,
          })
        );

        series.strokes.template.set('strokeWidth', 2);

        series.set('tooltipText', '[bold]{name}[/]: {valueY}');

        series.data.setAll(data);
      }

      createSeries1('ALO');
      createSeries('CPC');
      createSeries('CPCA');
      createSeries('PROMESSA');

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
          maxWidth: root.width(),
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
