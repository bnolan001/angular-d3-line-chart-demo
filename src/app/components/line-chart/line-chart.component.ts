import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import weatherData from '../../assets/weather-data.json';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent implements OnInit {
  public activeField: number;
  public dataFields: string[] = ['Temperature', 'Dewpoint', 'Visibility'];
  public chartData: any;
  private host: any;
  private svg: any;
  private htmlElement: HTMLElement;
  public data: number[] = [];

  private margin = { top: 10, right: 10, bottom: 15, left: 25 };
  public width: number;
  public height: number;
  private x: any;
  private y: any;
  private line: d3Shape.Line<[number, number]>; // this is line definition

  constructor(public elRef: ElementRef) {
    this.htmlElement = this.elRef.nativeElement;
    this.chartData = {data: [], locationName: ''};
    this.activeField = 0;
  }

  ngOnInit() {
    this.host = d3.select(this.htmlElement);
    let svgElement: any = this.htmlElement.getElementsByClassName('svg-chart')[0];
    this.width = svgElement.clientWidth - this.margin.left - this.margin.right;
    this.height = svgElement.clientHeight * 0.90 - this.margin.top - this.margin.bottom;

    this.setup();
    this.refresh();
  }

  public refresh() {
    this.updateGraphData();
  }

  private setup(): void {
    console.log('LineChartComponent:setup');
    this.chartData.data = weatherData.observations;
    this.chartData.locationName = weatherData.locationName.toLocaleUpperCase(); 
    this.buildSvg();
    this.configureXaxis();
    this.configureYaxis();
    this.drawLineAndPath();

  }

  /**
   * Configures the SVG element
   */
  private buildSvg() {
    console.log('LineChartComponent:buildSvg');
    this.svg = this.host.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.svg
      .append("text")
      .text(this.chartData.locationName) // set watermark
      .attr("y", "50%")
      .attr("x", "40%")
      .style("fill", "#333333")
      .style("font-size", "2.3em")
      .style("font-weight", "bold")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
  }

  /**
   * Configures the X-axis based on the time series
   */
  private configureXaxis(): void {
    console.log('LineChartComponent:configureXaxis');
    // range of data configuring
    this.x = d3Scale.scaleTime()
      .range([0, this.width])
      .domain(d3Array.extent(this.data, (d) => d.date));

    // Configure the Y Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

  }

  /**
   * Configures the Y-axis based on the data values
   */
  private configureYaxis(): void {
    // range of data configuring
    let yRange: any[] = d3Array.extent(this.data, (d) => d.value);
    if (yRange && yRange.length > 1
      && yRange[0] !== yRange[yRange.length - 1]) {
      yRange[0] -= 1;
    }
    this.y = d3Scale.scaleLinear()
      .range([this.height, 0])
      .domain(yRange);

    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));

  }

  /**
   * Configures and draws the line on the graph
   */
  private drawLineAndPath() {
    console.log('LineChartComponent:drawLineAndPath');
    this.line = d3Shape.line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    // Configuring line path
    this.svg.append('path')
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", this.line);
  }

  /**
   * Execute the methods necessary to update the graph with the data retrieve
   * @param obsData
   */
  public updateGraphData(): void {
    console.log('LineChartComponent:updateGraphData');
    this.activeField++;
    if (this.activeField >= this.dataFields.length){
      this.activeField = 0;
    }
    // Remove the current line form the chart
    this.clearChartData();
    
    // Build the data array for chart
    this.data = this.buildChartData();

    // Configuring line path
    this.configureXaxis();
    this.configureYaxis();

    // Build the line for the chart
    this.drawLineAndPath();
  }

  /**
   * Creates the chart data array by selecting the
   * appropriate data based on the user selection
   */
  private buildChartData(): any {
    console.log('LineChartComponent:buildChartData');
    let data: any = [];
    if (this.chartData != null
      && this.chartData.data != null) {
      let value: any = null;

      this.chartData.data.forEach((d) => {
        if (this.activeField === 0){
          value = d.temperature;
        }
        else if (this.activeField === 1){
          value = d.dewpoint;
        }
        else if (this.activeField === 2){
          value = d.visibility;
        }

        if (value !== null) {
          data.push(
            {
              date: new Date(d.time),
              value: value
            });
        }
      });
    }

    return data;
  }

  /**
   * Removes all lines and axis from the chart
   */
  private clearChartData(): void {
    console.log('LineChartComponent:clearChartData');
    if (this.chartData !== null
      && this.chartData.data.length > 0) {
      this.svg.selectAll('g').remove();
      this.svg.selectAll('path').remove();
    }
  }
}
