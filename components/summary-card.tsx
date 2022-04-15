import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LineMarkSeries,
  FlexibleWidthXYPlot,
  HorizontalGridLines,
} from 'react-vis';

type SummaryCardProps = {
  icon: JSX.Element;
  average: string;
  latest: string;
  history: {
    ts: string;
    value: number;
  }[];
  name: string;
  units: string;
};

type HighlightedNode = {
  x: number;
  y: number;
  value: number;
  ts: string;
};

const SummaryCard: React.FC<SummaryCardProps> = (props) => {
  const { latest, average, history, name, units, icon } = props;
  const [highlighted, setHightlighted] = useState<HighlightedNode>();
  let tooltip: JSX.Element | undefined;

  // Debounce the setHighlight calls to avoid flashing when the cursor is
  // on the edge of a node in the graph
  const debouncedSetHighlight = useCallback(
    debounce((v) => setHightlighted(v), 200),
    []
  );

  // Tooltips are shown based on the cursor entering the mark point on the
  // graph. On mobile devices this position is retained even when scrolling.
  // Hide the tool tip when scroll events occur, and also if the window is
  // resized to avoid floating tooltips in the wrong location
  useEffect(() => {
    const dismissHighlight = () => setHightlighted(undefined);

    window.addEventListener('scroll', dismissHighlight);
    window.addEventListener('resize', dismissHighlight);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener('scroll', dismissHighlight);
      window.removeEventListener('resize', dismissHighlight);
    };
  });

  // Memoise the chart so it's not re-rendered on tooltip state changes
  const chart = useMemo(() => {
    return (
      <FlexibleWidthXYPlot
        // The svg.g.path element has a default transform of (x=40, y=10). It
        // seems odd, but I assume it's a default that provides room for the
        // y-axis values. I've disabled that, so now it's just empty space to
        // the left of the chart.
        //
        // This space causes the chart to be off-center. Setting margin-left
        // to 10px sets the transform x=10, and correctly centers the charts
        margin={{ left: 10 }}
        height={150}
      >
        <HorizontalGridLines />
        <LineMarkSeries
          animation
          onSeriesMouseOut={() => debouncedSetHighlight(undefined)}
          onValueMouseOver={(item: any, eventContainer: any) => {
            // The event is nested in an object for some reason. Cast to any and
            // YOLO it. It'll be fine, hopefully...
            debouncedSetHighlight({
              value: item.y,
              ts: history[item.x as number].ts,
              x: eventContainer.event.clientX,
              y: eventContainer.event.clientY,
            });
          }}
          fill={'white'}
          size={3.5}
          stroke={'white'}
          strokeWidth={1.5}
          lineStyle={{ fill: 'transparent' }}
          data={history.map((point, x) => {
            return { x, y: point.value };
          })}
        />
      </FlexibleWidthXYPlot>
    );
  }, []);

  if (highlighted) {
    tooltip = (
      <div
        className="shadow-md font-semibold highlight bg-white rounded p-4"
        style={{ position: 'fixed', top: highlighted?.y, left: highlighted?.x }}
      >
        <p>
          {highlighted.value} {units}
        </p>
        <span className="text-xs text-slate-500">
          {new Date(highlighted.ts).toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div className="grow w-full sm:w-4/12 bg-blue-500 p-6">
      {tooltip}
      <h3 className="text-3xl pb-3 text-white font-semibold">
        {icon}
        {name}
      </h3>
      <p className="text-white text-2xl pb-1">
        Latest: {latest} {units}
      </p>
      <p className="text-slate-100">
        Average: {average} {units}
      </p>
      <div className="pt-7">{chart}</div>
    </div>
  );
};

export default SummaryCard;
