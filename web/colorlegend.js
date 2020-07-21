const colorLegend = (selection, props, highlighter, remHighlight) => {
  const {
    colorScale,
    circleRadius,
    spacing,
    textOffset
  } = props;

  const groups = selection.selectAll('g')
    .data(colorScale.domain());

  const labels =
  groups.enter().append('g')
    .attr('id', (d, i) => colorScale.domain()[i])
    .attr('class', 'legend')
    .on('mouseenter', (d, i) => highlighter(colorScale.domain()[i]))
    .on('mouseout', () => remHighlight());
  labels.merge(groups)
    .attr('transform', (d, i) => `translate(0, ${i * spacing})`);
  groups.exit().remove();

  labels.append('circle')
    .merge(groups.select('circle'))
      .attr('r', circleRadius)
      .attr('fill', colorScale);

  labels.append('text')
    .merge(groups.select('text'))
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', textOffset);
}