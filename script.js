fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(response => response.json())
  .then(data => showHeatMap(data));

function showHeatMap(data) {
  const w = 1400;
  const h = 800;
  const paddingLeft = 100;
  const paddingRight = 50;
  const paddingBottom = 100;

  const baseTemp = data.baseTemperature;
  const variances = data.monthlyVariance;

  const parseMonth = d3.timeParse("%m");
  const parseYear = d3.timeParse("%Y");

  const yearSet = new Set();
  variances.forEach(v => yearSet.add(parseInt(v.year)));
  const years = Array.from(yearSet);
  years.sort((a, b) => a - b);

  const monthSet = new Set();
  variances.forEach(v => monthSet.add(parseInt(v.month)));
  const months = Array.from(monthSet);
  months.sort((a, b) => a - b);

  console.log(years);
  console.log(months);

  const xScale = d3.scaleBand()
    .domain(years.map(y => parseYear(y)))
    .rangeRound([paddingLeft, w - paddingRight]);

  const yScale = d3.scaleBand()
    .domain(months.map(m => parseMonth(m)))
    .rangeRound([0, h - paddingBottom]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(years.filter(y => y % 10 === 0).map(y => parseYear(y)))
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

  const cellWidth = xScale(parseYear(1756)) - xScale(parseYear(1755));
  const cellHeight = yScale(parseMonth(2));

  const heatColors = ["#4A4EEE", "#4A77EE", "#4AA0EE", "#4AC9EE", "#4AEEE9",
    "#D2EE4A", "#EEE04A", "#EEB74A", "#EE8E4A", "#EE654A", "#EE4A57"
  ];

  const getHeatColor = temp => {
    return (temp < 3) ? heatColors[0] : (temp > 3 && temp < 4) ? heatColors[1] :
      (temp > 4 && temp < 5) ? heatColors[2] : (temp > 5 && temp < 6) ? heatColors[3] :
      (temp > 6 && temp < 7) ? heatColors[4] : (temp > 7 && temp < 8.6) ? heatColors[5] :
      (temp > 8.6 && temp < 9.6) ? heatColors[6] : (temp > 9.6 && temp < 10.6) ?
      heatColors[7] : (temp > 10.6 && temp < 11.6) ? heatColors[8] :
      (temp > 11.6 && temp < 12.6) ? heatColors[9] : heatColors[10];
  }

  svg.selectAll("rect")
    .data(variances)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(parseYear(d.year)))
    .attr("y", d => yScale(parseMonth(d.month)))
    .attr("width", (d, i) => cellWidth)
    .attr("height", d => cellHeight)
    .attr("fill", d => getHeatColor(baseTemp + d.variance))
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemp + d.variance);
}
