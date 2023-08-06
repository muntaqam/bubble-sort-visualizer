import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function BubbleSortChart({ data }) {
  const ref = useRef();

  const svgWidth = 900;
  const svgHeight = 900;

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sortingDone, setSortingDone] = useState(false);

  const timer = useRef(null);

  useEffect(() => {
    const svg = d3.select(ref.current).attr('width', svgWidth).attr('height', svgHeight);

    const barWidth = 35;
    const barSpacing = 42;
   // const xScale = d3.scaleLinear().domain([0, data.length]).range([0, data.length * barSpacing]);

    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, svgHeight]);


    const bars = svg.selectAll('rect').data(data);

    bars.exit().remove();

    bars.enter()
      .append('rect')
      .attr('x', (d, i) => i * barSpacing)
      .attr('y', (d) => svgHeight - padding - yScale(d))
      .attr('width', barWidth)
      .attr('height', (d) => yScale(d))
      .attr('fill', 'steelblue');

    const text = svg.selectAll('.bar-label').data(data);

    text.enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d, i) => i * barSpacing + barWidth / 2)
      .attr('y', (d) => svgHeight - padding - yScale(d) + 15)
      .attr('text-anchor', 'middle')
      .text((d) => d)
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold');
  }, [data]);

  const resetDataAndSort = () => {
   // setOriginalData(randomizeData(data.slice()));
    setSortingDone(false); 
    setIsPlaying(false); 
    window.location.reload(); 
  };

  useEffect(() => {
    const svg = d3.select(ref.current);

    const barWidth = 35;
    const barSpacing = 42; // 30 * 1.4
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, svgHeight - padding]);

    const updateBars = (newData, comparedIndexes) => {
      const bars = svg.selectAll('rect').data(newData, (d) => d);

      bars.exit().remove();

      bars
        .attr('fill', (d, i) => (comparedIndexes.includes(i) ? '#4CAF50' : 'steelblue'))
        .attr('x', (d, i) => i * barSpacing)
        .attr('y', (d) => svgHeight - padding - yScale(d))
        .attr('height', (d) => yScale(d))
        .attr('width', barWidth)
        .transition() 
        .duration(500)
        .attr('y', (d) => svgHeight - padding - yScale(d))
        .attr('height', (d) => yScale(d));

      bars.enter()
        .append('rect')
        .attr('x', (d, i) => i * barSpacing)
        .attr('y', (d) => svgHeight - padding - yScale(0)) 
        .attr('width', barWidth)
        .attr('height', (d) => yScale(0)) 
        .attr('fill', (d, i) => (comparedIndexes.includes(i) ? '#4CAF50' : 'steelblue'))
        .transition() 
        .duration(500)
        .attr('y', (d) => svgHeight - padding - yScale(d))
        .attr('height', (d) => yScale(d));

      const text = svg.selectAll('.bar-label').data(newData, (d) => d);

      text
        .attr('x', (d, i) => i * barSpacing + barWidth / 2)
        .attr('y', (d) => svgHeight - padding - yScale(d) + 15)
        .attr('text-anchor', 'middle')
        .text((d) => d)
        .style('font-weight', 'bold');

      text.enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d, i) => i * barSpacing + barWidth / 2)
        .attr('y', (d) => svgHeight - padding - yScale(d) + 15)
        .attr('text-anchor', 'middle')
        .text((d) => d)
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold');

      text.exit().remove();
    };

    const bubbleSort = () => {
      let sorted = false;
      let n = data.length;

     timer.current = setInterval(() => { // Update timer reference
        if (isPlaying && !sorted) {
          sorted = true;
          for (let i = 0; i < n - 1; i++) {
            if (data[i] > data[i + 1]) {
              const temp = data[i];
              data[i] = data[i + 1];
              data[i + 1] = temp;
              sorted = false;
              updateBars(data.slice(), [i, i + 1]);
            }
          }
          n--;
        } else if (!isPlaying) {
          clearInterval(timer.current);
        } else if (sorted) {
          clearInterval(timer.current);
          setSortingDone(true); // sorting is completed so reset random
        }
      }, 1000 / speed);
    };

    if (!isPlaying) {
      clearInterval(timer.current);
    } else {
      bubbleSort();
    }

    return () => clearInterval(timer.current);
  }, [data, isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

      return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg ref={ref} width={svgWidth} height={svgHeight} style={{ marginLeft: '15%' }}></svg>
        <div className="controls" style={{ marginLeft: '10px' }}>
          {sortingDone ? (
            <button className="reset" style={{ marginLeft: '10px' }} onClick={resetDataAndSort}>
              Reset
            </button>
          ) : (
            <>
              <button className={`play-pause ${isPlaying ? 'pause' : 'play'}`} onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <label className="speed-label">
                Speed:
                <div className="select-wrapper">
                  <select className="speed" value={speed} onChange={handleSpeedChange}>
                    <option value={0.5}>0.5x</option>
                    <option value={0.7}>0.7x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                  <div className="select-icon"></div>
                </div>
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BubbleSortChart;