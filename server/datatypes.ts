/**
 * Column names used for storage of data in sqlite
 */
export enum ColumnName {
  ResultId = 'result_id',
  ResultUrl = 'result_url',
  Timestamp = 'timestamp',
  UploadBandwidth = 'upload_bandwidth',
  UploadBytes = 'upload_bytes',
  UploadElapsed = 'upload_elapsed',
  DownloadBandwidth = 'download_bandwidth',
  DownloadBytes = 'download_bytes',
  DownloadElapsed = 'download_elapsed',
  PingJitter = 'ping_jitter',
  PingLatency = 'ping_latency',
  ISP = 'isp',
  InterfaceExternalIp = 'interface_external_ip',
  InterfaceInternalIp = 'interface_internal_ip',
  InterfaceIsVpn = 'interface_is_vpn',
  InterfaceMacAddr = 'interface_mac_addr',
  InterfaceName = 'interface_name',
  PacketLoss = 'packetloss',
  ServerCountry = 'server_country',
  ServerHost = 'server_host',
  ServerHostFunctional = 'server_host_functional',
  ServerId = 'server_id',
  ServerIp = 'server_ip',
  ServerLocation = 'server_location',
  ServerName = 'server_name',
  ServerPort = 'server_port',
  ServerSponsor = 'server_sponsor',
}

export type DatabaseColumnConfig = {
  Key: string;
  Type: 'text' | 'boolean' | 'real' | 'integer';
};

export interface NormalisedSpeedtestResult {
  [ColumnName.ResultId]: string;
  [ColumnName.ResultUrl]: string;
  [ColumnName.Timestamp]: string;
  [ColumnName.UploadBandwidth]: number;
  [ColumnName.UploadBytes]: number;
  [ColumnName.UploadElapsed]: number;
  [ColumnName.DownloadBandwidth]: number;
  [ColumnName.DownloadBytes]: number;
  [ColumnName.DownloadElapsed]: number;
  [ColumnName.PingJitter]: number;
  [ColumnName.PingLatency]: number;
  [ColumnName.ISP]: string;
  [ColumnName.InterfaceExternalIp]: string;
  [ColumnName.InterfaceInternalIp]: string;
  [ColumnName.InterfaceIsVpn]: boolean;
  [ColumnName.InterfaceMacAddr]: string;
  [ColumnName.InterfaceName]: string;
  [ColumnName.PacketLoss]: number;
  [ColumnName.ServerCountry]: string;
  [ColumnName.ServerHost]: string;
  [ColumnName.ServerHostFunctional]: string;
  [ColumnName.ServerId]: number;
  [ColumnName.ServerIp]: string;
  [ColumnName.ServerLocation]: string;
  [ColumnName.ServerName]: string;
  [ColumnName.ServerPort]: number;
  [ColumnName.ServerSponsor]?: string;
}

/**
 * Mappings from db column name to the corresponding key in the speedtest
 * result object, and the sqlite data type used to store it.
 */
export const NormalisationConfig: {
  [key in ColumnName]: DatabaseColumnConfig;
} = {
  [ColumnName.ResultId]: {
    Key: 'result.id',
    Type: 'text',
  },
  [ColumnName.ResultUrl]: {
    Key: 'result.url',
    Type: 'text',
  },
  [ColumnName.Timestamp]: {
    Key: 'timestamp',
    Type: 'text',
  },
  [ColumnName.UploadBandwidth]: {
    Key: 'upload.bandwidth',
    Type: 'integer',
  },
  [ColumnName.UploadBytes]: {
    Key: 'upload.bytes',
    Type: 'integer',
  },
  [ColumnName.UploadElapsed]: {
    Key: 'upload.elapsed',
    Type: 'integer',
  },
  [ColumnName.DownloadBandwidth]: {
    Key: 'download.bandwidth',
    Type: 'integer',
  },
  [ColumnName.DownloadBytes]: {
    Key: 'download.bytes',
    Type: 'integer',
  },
  [ColumnName.DownloadElapsed]: {
    Key: 'download.elapsed',
    Type: 'integer',
  },
  [ColumnName.PingJitter]: {
    Key: 'ping.jitter',
    Type: 'real',
  },
  [ColumnName.PingLatency]: {
    Key: 'ping.latency',
    Type: 'real',
  },
  [ColumnName.ISP]: {
    Key: 'isp',
    Type: 'text',
  },
  [ColumnName.InterfaceExternalIp]: {
    Key: 'interface.externalIp',
    Type: 'text',
  },
  [ColumnName.InterfaceInternalIp]: {
    Key: 'interface.internalIp',
    Type: 'text',
  },
  [ColumnName.InterfaceIsVpn]: {
    Key: 'interface.isVpn',
    Type: 'boolean',
  },
  [ColumnName.InterfaceMacAddr]: {
    Key: 'interface.macAddr',
    Type: 'text',
  },
  [ColumnName.InterfaceName]: {
    Key: 'interface.name',
    Type: 'text',
  },
  [ColumnName.PacketLoss]: {
    Key: 'packetLoss',
    Type: 'real',
  },
  [ColumnName.ServerCountry]: {
    Key: 'server.country',
    Type: 'text',
  },
  [ColumnName.ServerHost]: {
    Key: 'server.host',
    Type: 'text',
  },
  [ColumnName.ServerHostFunctional]: {
    Key: 'server.host.functional',
    Type: 'text',
  },
  [ColumnName.ServerId]: {
    Key: 'server.id',
    Type: 'integer',
  },
  [ColumnName.ServerIp]: {
    Key: 'server.ip',
    Type: 'text',
  },
  [ColumnName.ServerLocation]: {
    Key: 'server.location',
    Type: 'text',
  },
  [ColumnName.ServerName]: {
    Key: 'server.name',
    Type: 'text',
  },
  [ColumnName.ServerPort]: {
    Key: 'server.port',
    Type: 'integer',
  },
  [ColumnName.ServerSponsor]: {
    Key: 'server.sponsor',
    Type: 'text',
  },
};
