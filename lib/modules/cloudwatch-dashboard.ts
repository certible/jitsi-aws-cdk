import type { DashboardProps } from 'aws-cdk-lib/aws-cloudwatch';
import {
  Dashboard,
  LogQueryVisualizationType,
  LogQueryWidget,
  TextWidget,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

/**
 * Configuration options for Jitsi component widgets
 */
export interface JitsiWidgetOptions {
  /** Prefix used to filter log streams */
  streamPrefix?: string;
  /** Widget base width (defaults to 8) */
  width?: number;
  /** Widget base height (defaults to 8) */
  height?: number;
  /** Time bin for aggregations (defaults to 15m) */
  timeBin?: string;
}

/**
 * CloudWatch Dashboard for Jitsi components
 * Creates and manages a dashboard for monitoring various Jitsi services
 */
export class JitsiCloudWatchDashboard extends Construct {
  /** The AWS CloudWatch Dashboard instance */
  dashboard: Dashboard;

  /** Default log groups to use for widgets */
  readonly defaultLogGroups?: string[] | string;

  /**
   * Creates a new CloudWatch Dashboard for Jitsi monitoring
   *
   * @param scope The parent Construct
   * @param id The construct's identifier
   * @param options Configuration options
   * @param options.dashboard Existing dashboard to use (optional)
   * @param options.dashboardId ID for a new dashboard (required if dashboard not provided)
   * @param options.dashboardProps Props for a new dashboard (optional only relevant if no existing dashboard is used)
   * @param options.defaultLogGroups Default log groups to use for widgets (optional)
   */
  constructor(
    scope: Construct,
    id: string,
    options: {
      /** Existing dashboard to use (optional) */
      dashboard?: Dashboard;
      /** ID for a new dashboard (required if dashboard not provided) */
      dashboardId?: string;
      /** Props for a new dashboard (optional only relevant if no existing dashboard is used) */
      dashboardProps?: DashboardProps;
      /** Default log groups to use for widgets (optional) */
      defaultLogGroups?: string[] | string;
    },
  ) {
    super(scope, id);

    if (!options.dashboard && !options.dashboardId) {
      throw new Error(
        'Either a dashboard construct or dashboardId with optional props must be provided',
      );
    }

    if (options.dashboard && options.dashboardId) {
      throw new Error(
        'Either a dashboard construct or dashboardId with optional props must be provided, not both',
      );
    }

    if (options.dashboard && options.dashboardProps) {
      console.warn(
        'dashboardProps will be ignored as an existing dashboard is being used',
      );
    }

    this.defaultLogGroups = options.defaultLogGroups;

    this.dashboard =
      options.dashboard ??
      new Dashboard(this, options.dashboardId!, options.dashboardProps ?? {});
  }

  /**
   * Add Jitsi Web monitoring widgets to the dashboard
   *
   * @param logGroups Log group name(s) to query, if not provided the default log groups will be used
   * @param options Configuration options
   */
  addWeb(
    logGroups: string | string[] | undefined = undefined,
    options: JitsiWidgetOptions = {},
  ): void {
    if (!logGroups && this.defaultLogGroups) {
      logGroups = this.defaultLogGroups;
    }
    if (!logGroups) {
      throw new Error('Log groups must be provided or set as default');
    }
    jitsiWidgetsWeb(this.dashboard, logGroups, options);
  }

  /**
   * Add JVB (Jitsi Videobridge) monitoring widgets to the dashboard
   *
   * @param logGroups Log group name(s) to query, if not provided the default log groups will be used
   * @param options Configuration options
   */
  addJvb(
    logGroups: string | string[] | undefined = undefined,
    options: JitsiWidgetOptions = {},
  ): void {
    if (!logGroups && this.defaultLogGroups) {
      logGroups = this.defaultLogGroups;
    }
    if (!logGroups) {
      throw new Error('Log groups must be provided or set as default');
    }
    jitsiWidgetsJvb(this.dashboard, logGroups, options);
  }

  /**
   * Add Jicofo monitoring widgets to the dashboard
   *
   * @param logGroups Log group name(s) to query, if not provided the default log groups will be used
   * @param options Configuration options
   */
  addJicofo(
    logGroups: string | string[] | undefined = undefined,
    options: JitsiWidgetOptions = {},
  ): void {
    if (!logGroups && this.defaultLogGroups) {
      logGroups = this.defaultLogGroups;
    }
    if (!logGroups) {
      throw new Error('Log groups must be provided or set as default');
    }
    jitsiWidgetsJicofo(this.dashboard, logGroups, options);
  }

  /**
   * Add Prosody monitoring widgets to the dashboard
   *
   * @param logGroups Log group name(s) to query, if not provided the default log groups will be used
   * @param options Configuration options
   */
  addProsody(
    logGroups: string | string[] | undefined = undefined,
    options: JitsiWidgetOptions = {},
  ): void {
    if (!logGroups && this.defaultLogGroups) {
      logGroups = this.defaultLogGroups;
    }
    if (!logGroups) {
      throw new Error('Log groups must be provided or set as default');
    }
    jitsiWidgetsProsody(this.dashboard, logGroups, options);
  }

  /**
   * Add Jibri monitoring widgets to the dashboard
   *
   * @param logGroups Log group name(s) to query, if not provided the default log groups will be used
   * @param options Configuration options
   */
  addJibri(
    logGroups: string | string[] | undefined = undefined,
    options: JitsiWidgetOptions = {},
  ): void {
    if (!logGroups && this.defaultLogGroups) {
      logGroups = this.defaultLogGroups;
    }
    if (!logGroups) {
      throw new Error('Log groups must be provided or set as default');
    }
    jitsiWidgetsJibri(this.dashboard, logGroups, options);
  }
}

/**
 * Create Jitsi Web monitoring widgets and add them to the dashboard
 *
 * @param dashboard The dashboard to add widgets to
 * @param logGroups Log group name(s) to query
 * @param options Configuration options
 */
export function jitsiWidgetsWeb(
  dashboard: Dashboard,
  logGroups: string | string[],
  options: JitsiWidgetOptions = {},
): void {
  const {
    streamPrefix = 'jitsi/web_',
    width = 8,
    height = 8,
    timeBin = '5m',
  } = options;

  const logGroupNames = Array.isArray(logGroups) ? logGroups : [logGroups];
  const streamFilter = `filter @logStream like "${streamPrefix}"`;

  dashboard.addWidgets(
    new TextWidget({
      markdown: '## Jitsi Web Monitoring Dashboard',
      width: 24,
      height: 1,
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Jitsi Web Error Rate',
      view: LogQueryVisualizationType.LINE,
      width,
      height,
      queryLines: [
        `${streamFilter} and (@message like "ERROR" or @message like "error")`,
        `stats count(*) as count by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'HTTP Methods Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        'parse @message /"(?<method>GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH) /',
        'filter ispresent(method)',
        'stats count(*) as count by method',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'HTTP Status Code Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        'parse @message /(?<ip>[0-9.]+) (?<identd>\\S+) (?<user>\\S+) \\[(?<timestamp>[^\\]]+)\\] "(?<request>[^"]*)" (?<status_code>\\d{3}) (?<bytes>\\d+) "(?<referrer>[^"]*)" "(?<agent>[^"]*)"/',
        'filter ispresent(status_code)',
        'stats count(*) as count by status_code',
      ],
    }),
  );
}

/**
 * Create JVB monitoring widgets and add them to the dashboard
 *
 * @param dashboard The dashboard to add widgets to
 * @param logGroups Log group name(s) to query
 * @param options Configuration options
 */
export function jitsiWidgetsJvb(
  dashboard: Dashboard,
  logGroups: string | string[],
  options: JitsiWidgetOptions = {},
): void {
  const { streamPrefix = 'jitsi/jvb_', width = 8, height = 8 } = options;

  const logGroupNames = Array.isArray(logGroups) ? logGroups : [logGroups];
  const streamFilter = `filter @logStream like "${streamPrefix}"`;

  dashboard.addWidgets(
    new TextWidget({
      markdown: '## JVB (Jitsi Videobridge) Monitoring Dashboard',
      width: 24,
      height: 1,
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'JVB Log Levels Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        "parse @message 'JVB * * * ' as date, time, level, rest",
        'filter ispresent(level)',
        'stats count(*) as count by level',
      ],
    }),
  );
}

/**
 * Create Jicofo monitoring widgets and add them to the dashboard
 *
 * @param dashboard The dashboard to add widgets to
 * @param logGroups Log group name(s) to query
 * @param options Configuration options
 */
export function jitsiWidgetsJicofo(
  dashboard: Dashboard,
  logGroups: string | string[],
  options: JitsiWidgetOptions = {},
): void {
  const {
    streamPrefix = 'jitsi/jicofo_',
    width = 8,
    height = 8,
    timeBin = '15m',
  } = options;

  const logGroupNames = Array.isArray(logGroups) ? logGroups : [logGroups];
  const streamFilter = `filter @logStream like "${streamPrefix}"`;

  dashboard.addWidgets(
    new TextWidget({
      markdown: '## Jicofo Monitoring Dashboard',
      width: 24,
      height: 1,
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Jicofo Log Levels Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        "parse @message 'Jicofo * * * ' as date, time, level, rest",
        'filter ispresent(level)',
        'stats count(*) as count by level',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Conference Requests',
      view: LogQueryVisualizationType.BAR,
      width: width * 2,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "Conference request"',
        `stats count(*) as requestCount by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Member Join/Leave Events',
      view: LogQueryVisualizationType.BAR,
      width: width * 1.5,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "JitsiMeetConferenceImpl.onMemberJoined" or @message like "JitsiMeetConferenceImpl.onMemberLeft"',
        'parse @message "JitsiMeetConferenceImpl.*#" as eventType',
        `stats sum(eventType = "onMemberJoined") as Joined, sum(eventType = "onMemberLeft") as Left by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Active Conferences',
      view: LogQueryVisualizationType.LINE,
      width: width * 1.5,
      height,
      queryLines: [
        streamFilter,
        'parse @message /\\[room=(?<room_id>[^ ]*) meeting_id=(?<meeting_id>[^\\] ]*)/',
        'filter ispresent(meeting_id)',
        `stats count_distinct(meeting_id) as count by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Conference Start/Stop Events',
      view: LogQueryVisualizationType.BAR,
      width: width * 1.5,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "JitsiMeetConferenceImpl.<init>" or @message like "JitsiMeetConferenceImpl.stop"',
        'parse @message "JitsiMeetConferenceImpl.*#" as eventType',
        `stats sum(eventType = "<init>") as Init, sum(eventType = "stop") as Stop by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Jibri Recording Session Start | Stop Events',
      view: LogQueryVisualizationType.BAR,
      width: width * 1.5,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "JibriSession.startInternal" or @message like "JibriSession.stop"',
        'parse @message "JibriSession.*#" as eventType',
        `stats sum(eventType = "startInternal") as Start, sum(eventType = "stop") as Stop by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),
  );
}

/**
 * Create Prosody monitoring widgets and add them to the dashboard
 *
 * @param dashboard The dashboard to add widgets to
 * @param logGroups Log group name(s) to query
 * @param options Configuration options
 */
export function jitsiWidgetsProsody(
  dashboard: Dashboard,
  logGroups: string | string[],
  options: JitsiWidgetOptions = {},
): void {
  const {
    streamPrefix = 'jitsi/prosody_',
    width = 8,
    height = 8,
    timeBin = '15m',
  } = options;

  const logGroupNames = Array.isArray(logGroups) ? logGroups : [logGroups];
  const streamFilter = `filter @logStream like "${streamPrefix}"`;

  dashboard.addWidgets(
    new TextWidget({
      markdown: '## Prosody Monitoring Dashboard',
      width: 24,
      height: 1,
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Prosody Log Levels Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        /* there is a tab between level and message */
        'parse @message "* * * *\\t*" as date, time, connection_id, level, message',
        'filter ispresent(level)',
        'fields trim(level) as trim_level',
        'stats count(*) as count by trim_level',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Client Connection Events',
      view: LogQueryVisualizationType.BAR,
      width: width * 2,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "Client disconnected" or @message like "Client connected"',
        `stats sum(@message like "Client connected") as Connected, sum(@message like "Client disconnected") as Disconnected by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),
  );
}

/**
 * Create Jibri monitoring widgets and add them to the dashboard
 *
 * @param dashboard The dashboard to add widgets to
 * @param logGroups Log group name(s) to query
 * @param options Configuration options
 */
export function jitsiWidgetsJibri(
  dashboard: Dashboard,
  logGroups: string | string[],
  options: JitsiWidgetOptions = {},
): void {
  const {
    streamPrefix = 'jitsi/jibri_',
    width = 8,
    height = 8,
    timeBin = '15m',
  } = options;

  const logGroupNames = Array.isArray(logGroups) ? logGroups : [logGroups];
  const streamFilter = `filter @logStream like "${streamPrefix}"`;

  dashboard.addWidgets(
    new TextWidget({
      markdown: '## Jibri Monitoring Dashboard',
      width: 24,
      height: 1,
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Jibri Log Levels Distribution',
      view: LogQueryVisualizationType.PIE,
      width,
      height,
      queryLines: [
        streamFilter,
        "parse @message 'Jibri * * * ' as date, time, level, rest",
        'filter ispresent(level)',
        'stats count(*) as count by level',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Active Jibri Services',
      view: LogQueryVisualizationType.LINE,
      width,
      height,
      queryLines: [
        streamFilter,
        'parse @logStream "jitsi/jibri_*-*" as version, container_id',
        'filter ispresent(container_id)',
        `stats count_distinct(container_id) as activity_count by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),

    new LogQueryWidget({
      logGroupNames,
      title: 'Active Jibri Recordings',
      view: LogQueryVisualizationType.LINE,
      width,
      height,
      queryLines: [
        streamFilter,
        'filter @message like "MediaReceivedStatusCheck.run"',
        'parse @message "[session_id=*]" as session_id',
        'filter ispresent(session_id)',
        `stats count_distinct(session_id) as count by bin(${timeBin})`,
        'sort @timestamp asc',
      ],
    }),
  );
}
