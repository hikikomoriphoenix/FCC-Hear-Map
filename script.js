fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(response => response.json())
  .then(data => showHeatMap(data));

function showHeatMap(data) {
  const w = 1500;
  const h = 800;
  const paddingLeft = 200;
  const paddingRight = 50;
  const paddingBottom = 300;

  const baseTemp = data.baseTemperature;
  const variances = data.monthlyVariance;

  const parseMonth = d3.timeParse("%m");
  const parseYear = d3.timeParse("%Y");
  const formatMonth = d3.timeFormat("%B");

  const yearSet = new Set();
  variances.forEach(v => yearSet.add(parseInt(v.year)));
  const years = Array.from(yearSet);
  years.sort((a, b) => a - b);

  const monthSet = new Set();
  variances.forEach(v => monthSet.add(parseInt(v.month)));
  const months = Array.from(monthSet);
  months.sort((a, b) => a - b);

  const xScale = d3.scaleBand()
    .domain(years.map(y => parseYear(y)))
    .rangeRound([0, w - paddingLeft - paddingRight]);

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
    .attr("id", "heatmap")
    .attr("width", w)
    .attr("height", h);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${paddingLeft}, ${h - paddingBottom})`)
    .call(xAxis)
    .append("text")
    .text("YEARS")
    .attr("x", (w-paddingLeft-paddingRight)/2)
    .attr("y", 50)
    .attr("fill", "black")
    .style("text-anchor", "middles")
    .style("font-size", "18px");

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${paddingLeft}, ${0})`)
    .call(yAxis)
    .append("text")
    .text("MONTHS")
    .attr("transform", `translate(${-70},${(h-paddingBottom)/2})rotate(-90)`)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-size", "18px");

  const cellWidth = xScale(parseYear(1756)) - xScale(parseYear(1755));
  const cellHeight = yScale(parseMonth(2));

  const heatColors = ["#4A4EEE", "#4A77EE", "#4AA0EE", "#4AC9EE", "#4AEEE9",
    "#D2EE4A", "#EEE04A", "#EEB74A", "#EE8E4A", "#EE654A", "#EE4A57"
  ];

  const getHeatColor = temp => {
    return (temp < 3) ? heatColors[0] : (temp >= 3 && temp < 4) ? heatColors[1] :
      (temp >= 4 && temp < 5) ? heatColors[2] : (temp >= 5 && temp < 6) ? heatColors[3] :
      (temp >= 6 && temp < 7) ? heatColors[4] : (temp >= 7 && temp < 8.6) ? heatColors[5] :
      (temp >= 8.6 && temp < 9.6) ? heatColors[6] : (temp >= 9.6 && temp < 10.6) ?
      heatColors[7] : (temp >= 10.6 && temp < 11.6) ? heatColors[8] :
      (temp >= 11.6 && temp < 12.6) ? heatColors[9] : heatColors[10];
  }

  const tooltip = d3.select("#container")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  svg.selectAll("rect")
    .data(variances)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(parseYear(d.year)) + paddingLeft)
    .attr("y", d => yScale(parseMonth(d.month)))
    .attr("width", (d, i) => cellWidth)
    .attr("height", d => cellHeight)
    .attr("fill", d => getHeatColor(baseTemp + d.variance))
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemp + d.variance)
    .on("mouseover", (d, i) => {
      const info = `Date: ${formatMonth(parseMonth(d.month))}, ${d.year}<br>
    Temperature: ${baseTemp + d.variance}°C`;
      const svgRect = document.getElementById("heatmap").getBoundingClientRect();
      const x = svgRect.x + xScale(parseYear(d.year)) + paddingLeft;
      const y = svgRect.y + yScale(parseMonth(d.month));

      tooltip.style("opacity", 1)
        .attr("data-year", variances[i].year)
        .style("left", x + "px")
        .style("top", y + "px")
        .html(info);
    })
    .on("mouseout", d => {
      tooltip.style("opacity", 0);
    });

  const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${paddingLeft}, ${h - 200})`);

  legend.selectAll("rect")
    .data(heatColors)
    .enter()
    .append("rect")
    .attr("fill", heatColor => heatColor)
    .attr("x", (d, i) => {
      if (i < 3) {
        return 0;
      } else if (i >= 3 && i < 6) {
        return 200;
      } else if (i >= 6 && i < 9) {
        return 400;
      } else if (i >= 9) {
        return 600;
      }
    })
    .attr("y", (d, i) => {
      if (i == 0 || i == 3 || i == 6 || i == 9) {
        return 0;
      } else if (i == 1 || i == 4 || i == 7 || i == 10) {
        return 40;
      } else if (i == 2 || i == 5 || i == 8) {
        return 80;
      }
    })
    .attr("width", 20)
    .attr("height", 20);

  const heatColorLabels = ["<3°C", "3°C - 3.999°C", "4°C - 4.999°C",
    "5°C - 5.999°C", "6°C - 6.999°C", "7°C - 8.599°C", "8.6°C - 9.599°C",
    "9.6°C - 10.599°C", "10.6°C - 11.599°C", "11.6°C - 12.599°C", "≥12.6°C"
  ]

  legend.selectAll("text")
    .data(heatColorLabels)
    .enter()
    .append("text")
    .text(label => label)
    .attr("x", (d, i) => {
      if (i < 3) {
        return 30;
      } else if (i >= 3 && i < 6) {
        return 230;
      } else if (i >= 6 && i < 9) {
        return 430;
      } else if (i >= 9) {
        return 630;
      }
    })
    .attr("y", (d, i) => {
      if (i == 0 || i == 3 || i == 6 || i == 9) {
        return 15;
      } else if (i == 1 || i == 4 || i == 7 || i == 10) {
        return 55;
      } else if (i == 2 || i == 5 || i == 8) {
        return 95;
      }
    });
}
