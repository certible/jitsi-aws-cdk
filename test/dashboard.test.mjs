import assert from 'node:assert';
import test from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Dashboard } from 'aws-cdk-lib/aws-cloudwatch';
import { JitsiCloudWatchDashboard } from '../dist/index.mjs';

export default test('test dashboard module', async (t) => {
  await t.test(
    'new dashboard should fail if no dashboardId and no dashboard is provided',
    () => {
      const app = new cdk.App();
      const main = new cdk.Stack(app, 'test-dashboard-stack');
      assert.throws(() => {
        new JitsiCloudWatchDashboard(main, 'test-dashboard', {});
      }, Error);
      app.synth();
    },
  );
  await t.test(
    'new dashboard should fail if both dashboardId and dashboard construct are given',
    () => {
      const app = new cdk.App();
      const main = new cdk.Stack(app, 'test-dashboard-stack');
      const dashboard = new Dashboard(main, 'test-dashboard');
      assert.throws(() => {
        new JitsiCloudWatchDashboard(main, 'test-dashboard', {
          dashboard,
          dashboardId: 'test-dashboard-id',
        });
      }, Error);
      app.synth();
    },
  );
  await t.test(
    'new dashboard should succeed if only dashboardId is provided',
    () => {
      const app = new cdk.App();
      const main = new cdk.Stack(app, 'test-dashboard-stack');
      new JitsiCloudWatchDashboard(main, 'test-dashboard', {
        dashboardId: 'test-dashboard-id',
      });
      app.synth();
    },
  );
  await t.test(
    'new dashboard should succeed if only dashboard construct is provided',
    () => {
      const app = new cdk.App();
      const main = new cdk.Stack(app, 'test-dashboard-stack');
      const dashboard = new Dashboard(main, 'pre-dashboard');
      new JitsiCloudWatchDashboard(main, 'test-dashboard', { dashboard });
      app.synth();
    },
  );
  await t.test(
    'init dashboard should include the dashboard resource in the template',
    () => {
      const app = new cdk.App({
        defaultStackSynthesizer: new cdk.DefaultStackSynthesizer({
          qualifier: 'test',
        }),
      });
      const main = new cdk.Stack(app, 'test-dashboard-stack');
      new JitsiCloudWatchDashboard(main, 'test-dashboard', {
        dashboardId: 'test-dashboard-id',
        dashboardProps: { dashboardName: 'test-dashboard' },
      });
      const template = Template.fromStack(main);
      template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
        DashboardName: 'test-dashboard',
      });
    },
  );
});
