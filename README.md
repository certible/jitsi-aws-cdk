# Jitsi AWS CDK

> **Note:** This package has been moved to [https://github.com/jitsi-contrib/jitsi-aws-cdk](https://github.com/jitsi-contrib/jitsi-aws-cdk). Please use the new repository for the latest updates and contributions.

A collection of TypeScript CDK stack constructs designed for deploying Jitsi Utilities on AWS.

## CloudWatch Dashboard

The `CloudWatchDashboard` construct creates a CloudWatch dashboard with pre-configured widgets tailored for visually monitoring Jitsi services. This setup requires existing CloudWatch log groups and streams that collect logs from Jitsi services.

![Jibri Example Dashboard](/examples/images/dashboard-jibri.png)

### Prerequisites: Sending Docker Container Logs to CloudWatch

To forward service logs from Docker containers to CloudWatch, use the `awslogs` log driver. Below is an example configuration for your `docker-compose.yml` file to send logs to CloudWatch:

```yaml
logging:
  driver: awslogs
  options:
    awslogs-group: ${AWSLOGS_GROUP}
    awslogs-region: eu-central-1
    tag: '{{ with split .ImageName ":" }}{{join . "_"}}{{end}}-{{.ID}}'
```

### Usage

You can integrate the `CloudWatchDashboard` construct into your CDK stack as shown below. The default `logStream` prefix used by various widgets follows the format `<ImageName>_ID-Identifier` (e.g., `jitsi/web_`). You can customize this by passing a different prefix to the `logStreamPrefix` parameter.

```typescript
import { JitsiCloudWatchDashboard } from '@certible/jitsi-aws-cdk'

export class ConferenceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)
    const myJitsiDashboard = new JitsiCloudWatchDashboard(this, 'JitsiDashboard', {
      dashboardId: 'jitsi',
    })
    /* Add widgets */
    const logGroupName = '/aws/ecs/jitsi-meet'
    myJitsiDashboard.addWeb(logGroupName)
  }
}
```

Additionally, all widget functions are available as standalone methods in the module. You can use them to add widgets to your own dashboard without instantiating the `JitsiCloudWatchDashboard` construct.

```typescript
import { jitsiWidgetsJibri } from '@certible/jitsi-aws-cdk'
import { Dashboard } from 'aws-cdk-lib/aws-cloudwatch'

export class ConferenceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)
    const myDashboard = new Dashboard(this, 'MyDashboard')
    jitsiWidgetsJibri(myDashboard, '/aws/ecs/jitsi-meet')
  }
}
```
