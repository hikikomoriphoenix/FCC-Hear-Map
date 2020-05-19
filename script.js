fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(response => response.json())
  .then(data => showHeatMap(data));

function showHeatMap(data) {
  const w = 1400;
  const h = 800;
  const paddingTop = 50;
  const paddingLeft = 100;
  const paddingRight = 50;
  const paddingBottom = 100;

  const baseTemp = data.baseTemperature;
  const variances = data.monthlyVariance;

  const parseMonth = d3.timeParse("%m");
  const parseYear = d3.timeParse("%Y");

  const xScale = d3.scaleBand()
    .domain(variances.map(d => parseYear(d.year)))
    .rangeRound([paddingLeft, w - paddingRight]);

  const yScale = d3.scaleBand()
    .domain(variances.map(d => parseMonth(d.month)))
    .rangeRound([paddingTop, h - paddingBottom]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(variances.filter(d => d.year % 10 === 0).map(d => parseYear(d.year)))
    .tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%B"));

  const svg = d3.select("#container")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${0}, ${h - paddingBottom})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${paddingLeft}, ${0})`)
    .call(yAxis);
}
