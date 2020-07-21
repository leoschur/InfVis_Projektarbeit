const formatTime = d3.timeFormat("%d %b");
const formatNumber = d3.format("~s");

var width = window.innerWidth,
  height = 500;

const defStrokeW = 2;


const highlighter = lineId => {
  d3.selectAll('.linepath')
    .transition()
    .duration(300)
    .attr('stroke-width', defStrokeW)
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
    .attr('stroke-width', defStrokeW)
    .attr('opacity', 1);
  d3.selectAll('.legend')
    .transition()
    .duration(100)
    .attr('opacity', 1);
}



const renderer = data => {
  const updateData = column => {

  }

  // Create svg
  const svg = d3.select('#linechart')
    .append('svg')
      .attr('width', width)
      .attr('height', height);

  // Datagetter
  const column = "cases";
  const xValue = d => d.date;
  var yValue = d => d.cases;
  const colorCode = d => d.state;

  // Dimensions
  const margin = { top:50, right: 240, bottom: 55, left: 60 };
  const innerWidth = width - (margin.left + margin.right);
  const innerHeight = height - (margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  // Group data
  const comparator = (a, b) => {
    return d3.descending(a.values[a.values.length - 1].cases,
      b.values[b.values.length - 1].cases);
  }

  const nestedData = d3.nest()
    .key(colorCode)
    .entries(data)
    .sort(comparator); // TODO Comparator currently hardcoded for total cases

  // Heading
  const titel = "Covid-19 in Germany";
  g.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('y', -margin.top + 30)
    .attr('x', innerWidth/2)
    .text(titel);
  
  // Scaling
  const stateList = nestedData.map(d => d.key);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(stateList);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const dateRange = d3.extent(data, xValue);
  const xScale = d3.scaleLinear()
    .domain(dateRange)
    .range([0, innerWidth]);

    // Y-Axis
  var yLabel = `Total ${column}`;
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);
  const Y = g.append('g')
    .attr('id', 'Y')
    .call(yAxis.tickFormat(formatNumber));
  Y.selectAll('.domain').remove();
  Y.append('text')
    .attr('class', 'axis-label-y')
    .text(yLabel)
    .attr('x', -innerHeight/2)
    .attr('y', -margin.left+20)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');
  
  // X-Axis
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
        .attr('stroke-width', defStrokeW);

  // Datapoints to show informationdensity
  g.append('g')
    .attr('id', 'data-dots')
    .selectAll('.data-dots').data(data)
      .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', 1)
        .classed('d-dots', true);

  // Colorlegend
  svg.append('g')
    .attr('transform', `translate(${margin.left + innerWidth + 20}, ${margin.top + 10})`)
    .attr('id', 'color-legend')
    .call(colorLegend, {
      colorScale,
      circleRadius: 10,
      spacing: innerHeight/16,
      textOffset: 15
    }, highlighter, remHighlight)
}


// open data
d3.csv("data/rki_slim_cum_test.csv", function(d) {
  return{
    date: new Date(+d.Refdatum),
    state: d.Bundesland,
    cases: +d.AnzahlFall,
    deaths: +d.AnzahlTodesfall,
    recovered: +d.AnzahlGenesen,
    acute: +d.AnzahlFall - +d.AnzahlTodesfall - +d.AnzahlGenesen // TODO doesn´t work with cumultated numbers
  };
}).then(data => {
  renderer(data);
})