const formatTime = d3.timeFormat("%d %B");

const width = 800,
  height = 600;

const svg =  d3.select('#linechart')
  .append('svg')
    .attr('width', width)
    .attr('height', height);


const renderer = data => {

  // Datagetter
  const xValue = d => d.date;
  var yValue = d => d.cases;
  const colorCode = d => d.state;

  // Dimensions
  const margin = { top:20, right: 20, bottom: 20, left: 60 };
  const innerWidth = width - (margin.left + margin.right);
  const innerHeight = height - (margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  // Group data
  const nestedData = d3.nest()
    .key(colorCode)
    .entries(data);

  // Heading
  const titel = "Covid-19 in Germany";
  g.append('text')
    .attr('class', 'title')
    .attr('y', 0)
    .text(titel);
  
  // Scaling
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(nestedData.map(d => d.key));

  // Y-Axis
  var yLabel = "Total Cases";
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-2)
    .tickPadding(10);
  const Y = g.append('g').call(yAxis);
  Y.selectAll('.domain').remove();
  
  // X-Axis
  const xLabel = "Time";
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();
  const xAxis = d3.axisBottom(xScale)
    .tickSize(4)
    .tickPadding(5);
  const X = g.append('g').call(xAxis.tickFormat(formatTime))
    .attr('transform', `translate(0, ${innerHeight})`);
  X.selectAll('.domain').remove();

  // Data
  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)));
  
  g.selectAll('.line-path').data(nestedData)
  .enter().append('path')
    .attr('class', 'linepath')
    .attr('d', d => lineGenerator(d.values))
    .attr('stroke', d => colorScale(d.key));
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