import useSWR from 'swr';
import SummaryCard from './summary-card';
import { NormalisedSpeedtestResult } from '../server/datatypes';
import { bytesToMegabits } from '../server/utils';
import {
  CloudDownloadOutline,
  CloudUploadOutline,
  RepeatOutline,
} from 'react-ionicons';

export type SummaryData = {
  averages:
    | {
        download: string;
        upload: string;
        ping: string;
      }
    | undefined;
  latest: {
    download: string;
    upload: string;
    ping: string;
    ts: string;
  };
};

const _fetch = (...args: any[]) =>
  fetch(args[0], args[1]).then((res) => res.json());

export default function Summary() {
  const summary = useSWR<SummaryData, Error>('/api/speedtest/summary', _fetch);
  const history = useSWR<NormalisedSpeedtestResult[], Error>(
    '/api/speedtest/history',
    _fetch
  );

  if (summary.error || history.error) {
    return <div>Error Rendering Summary</div>;
  } else if (summary.data && history.data) {
    return (
      <div>
        <div className="flex flex-wrap m-auto gap-5">
          <SummaryCard
            icon={
              <CloudDownloadOutline
                cssClasses={'inline float-right'}
                height={'36px'}
                width={'36px'}
                color={'white'}
              ></CloudDownloadOutline>
            }
            name="Download"
            units="Mbps"
            history={history.data.map((v) => {
              return {
                value: Number(bytesToMegabits(v.download_bandwidth).toFixed(2)),
                ts: v.timestamp,
              };
            })}
            latest={summary.data.latest.download}
            average={summary.data.averages?.download || '0'}
          />

          <SummaryCard
            icon={
              <CloudUploadOutline
                cssClasses={'inline float-right'}
                height={'36px'}
                width={'36px'}
                color={'white'}
              ></CloudUploadOutline>
            }
            name="Upload"
            units="Mbps"
            history={history.data.map((v) => {
              return {
                value: Number(bytesToMegabits(v.upload_bandwidth).toFixed(2)),
                ts: v.timestamp,
              };
            })}
            latest={summary.data.latest.upload}
            average={summary.data.averages?.upload || '0'}
          />

          <SummaryCard
            icon={
              <RepeatOutline
                cssClasses={'inline float-right'}
                height={'36px'}
                width={'36px'}
                color={'white'}
              ></RepeatOutline>
            }
            name="Ping"
            units="ms"
            history={history.data.map((v) => {
              return {
                value: v.ping_latency,
                ts: v.timestamp,
              };
            })}
            latest={summary.data.latest.ping}
            average={summary.data.averages?.ping || '0'}
          />
        </div>
        <p className="text-xs text-slate-500 pt-2 md:text-right text-center">
          Last updated on {new Date(summary.data.latest.ts).toLocaleString()}
        </p>
      </div>
    );
  } else {
    return <div>NODATA</div>;
  }
}
