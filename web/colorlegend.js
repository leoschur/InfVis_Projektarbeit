const colorLegend = (selection, properties, highlighter, remHighlight) => {
  const {
    colorScale,
    circleRadius,
    spacing,
    textOffset
  } = properties;

  const test = () => {
    console.log('hello world');
  }

  const groups = selection.selectAll('g')
    .data(colorScale.domain());

  // Create groups for Circles+Text
  const labels =
  groups.enter().append('g')
    .attr('id', d => d)
    .attr('class', 'legend')
    .on('mouseenter', d => highlighter(d))
    .on('mouseout', () => remHighlight());
  labels.merge(groups)
    .attr('transform', (d, i) => `translate(0, ${i * spacing})`);
  groups.exit().remove();

  // Add colored Circles
  labels.append('circle')
    .merge(groups.select('circle'))
      .attr('r', circleRadius)
      .attr('fill', colorScale);

  // Add text
  labels.append('text')
    .merge(groups.select('text'))
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', textOffset);
}