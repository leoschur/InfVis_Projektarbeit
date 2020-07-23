const formatTime = d3.timeFormat("%d %b");
const formatNumber = d3.format("~s");

const
  width = window.innerWidth,
  height = 500;

const defaultStrokeW = 2;

// Functions to highlight and unhighlight certain states (called by Eventlisteners)
const highlighter = lineId => {
  d3.selectAll('.linepath')
    .transition()
    .duration(300)
    .attr('stroke-width', defaultStrokeW)
    .attr('opacity', 0.2);
  d3.selectAll('.legend')
    .transition()
    .duration(300)
    .attr('opacity', 0.3);

  d3.selectAll(`#${lineId}`)
  .transition()
  .duration(100)
  .attr('stroke-width', 4)
  .attr('opacity', 1);
}
const remHighlight = () => {
  d3.selectAll('.linepath')
    .transition()
    .duration(400)
    .attr('stroke-width', defaultStrokeW)
    .attr('opacity', 1);
  d3.selectAll('.legend')
    .transition()
    .duration(100)
    .attr('opacity', 1);
}

// Actual renderer of the svg graphic (called after csv-file is loaded)
const renderer = data => {
  // ********** Create svg **********
  const svg = d3.select('#linechart')
    .append('svg')
      .attr('width', width)
      .attr('height', height);

  
  // ********** Datagetter **********
  const column = "cases";
  const xValue = d => d.date;
  var yValue = d => d.cases;
  const colorCode = d => d.state;


  // ********** Dimensions **********
  const margin = { top:50, right: 240, bottom: 55, left: 60 };
  const innerWidth = width - (margin.left + margin.right);
  const innerHeight = height - (margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  
  // ********** Group data **********
  const compareCases = (a, b) => {
    return d3.descending(a.values[a.values.length - 1].cases,
      b.values[b.values.length - 1].cases);
  }
  const compareDeaths = (a, b) => {
    return d3.descending(a.values[a.values.length - 1].deaths,
      b.values[b.values.length - 1].deaths);
  }
  const compareRecov = (a, b) => {
    return d3.descending(a.values[a.values.length - 1].recovered,
      b.values[b.values.length - 1].recovered);
  }

  const nestedData = d3.nest()
    .key(colorCode)
    .entries(data)
    .sort(compareCases);
  
  var columnNames = [];
  for (item in nestedData[0].values[0]) {
    columnNames.push(item);
  }
  hideColumn = ["date", "state"];
  columnNames = columnNames.filter(item => !hideColumn.includes(item));


  // ********** Heading **********
  const titel = "Weekly Covid-19 Development in Germany";
  g.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('y', -margin.top + 30)
    .attr('x', innerWidth/2)
    .text(titel);
  
  
  // ********** Scalings **********
  var sortedStateList = nestedData.map(d => d.key);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(sortedStateList);

  var yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const dateRange = d3.extent(data, xValue);
  const xScale = d3.scaleLinear()
    .domain(dateRange)
    .range([0, innerWidth]);

  
  // ********** Y-Axis **********
  const updateYlabel = clicked => {
    d3.selectAll('.axis-label-y')
      .transition().duration(200)
        .attr('opacity', 0.3);
    d3.select(`#${clicked}`)
      .transition().duration(500)
        .attr('opacity', 1);
    updateData(clicked);
  }

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10)
    .tickFormat(formatNumber);
  const Y = g.append('g')
    .attr('id', 'Y');
  const yTicks = Y.append('g')
    .attr('id', 'yTicks')
    .call(yAxis);
  Y.selectAll('.domain').remove();
  Y.append('g')
    .attr('id', 'yLabels')
    .selectAll('text').data(columnNames)
      .enter().append('text')
        .attr('id', d => d)
        .classed('axis-label-y', true)
        .text(d => d)
        .attr('x', (d, i) => { return (-innerHeight+100) + (100*i) })
        .attr('y', -margin.left+20)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('opacity', 0.3)
        .on('click', d => updateYlabel(d));
  Y.select('#cases')  // Set the first shown data to active
    .transition().duration(1000)
    .attr('opacity', 1);

  
  // ********** X-Axis **********
  const xLabel = "Time";
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(5)
    .tickFormat(formatTime)
    .tickValues(d3.timeDay.range(dateRange[0], dateRange[1], 7));
  const X = g.append('g')
    .attr('id', 'X')
    .call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`);
  X.selectAll('text') // Rotate X-Labels
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-65) translate(-5, -5)');
  X.selectAll('.domain').remove();
  X.append('text')  // Append X-Axis-Label
    .attr('class', 'axis-label-x')
    .text(xLabel)
    .attr('x', innerWidth/2)
    .attr('y', margin.bottom);

  
  // ********** Visualize the actual Data **********

  // Datalines
  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)));
  
  const lines = g.append('g')
    .attr('id', 'lines').selectAll('.line-path')
    .data(nestedData)
      .enter().append('path')
        .attr('id', d => d.key)
        .attr('class', 'linepath')
        .attr('d', d => lineGenerator(d.values))
        .attr('stroke', d => colorScale(d.key))
        .attr('stroke-width', defaultStrokeW);
  
  // Datapoints to show informationdensity
  const dots = g.append('g')
    .attr('id', 'data-dots')
    .selectAll('.data-dots').data(data)
      .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', 1)
        .classed('d-dots', true);

  
  // ********** Colorlegend **********
  const cl = svg.append('g')
    .attr('transform', `translate(${margin.left + innerWidth + 20}, ${margin.top + 10})`)
    .attr('id', 'color-legend')
    .call(colorLegend, {
      colorScale,
      circleRadius: 10,
      spacing: innerHeight/16,
      textOffset: 15
    }, highlighter, remHighlight);

  
  // ********** Updatefunction when usere selects different data to show **********
  const updateData = column => {
    // Figure out new ranking for the color legend
    var sortFor;
    switch (column) {
      case "cases": sortFor = compareCases; break;
      case "deaths": sortFor = compareDeaths; break;
      case "recovered": sortFor = compareRecov; break;
      default: sortFor = compareCases;
    }
    nestedData.sort(sortFor);
    sortedStateList = nestedData.map(d => d.key);
    // Resort the color legend
    cl.selectAll('g')
      .transition().duration(500)
      .attr('transform', d => `translate(${0}, ${sortedStateList.indexOf(d) * innerHeight/16})`);

    // Redefine the datagetter
    yValue = d => d[column];

    // Fit Y scale
    yScale.domain(d3.extent(data, yValue));
    yTicks
      .transition().duration(1000)
      .call(yAxis);
    Y.selectAll('.domain').remove();

    // Fit lines and dots
    lines
      .transition().duration(800)
      .attr('d', d => lineGenerator(d.values))
    dots
      .transition().duration(800)
      .attr('cy', d => yScale(yValue(d)))
  }
}


// open data
d3.csv("data/rki_slim_cum.csv", function(d) {
  return{
    date: new Date(+d.Refdatum),
    state: d.Bundesland,
    cases: +d.AnzahlFall,
    deaths: +d.AnzahlTodesfall,
    recovered: +d.AnzahlGenesen
  };
}).then(data => {
  renderer(data);
})