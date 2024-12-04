#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { projectName, stack1Region, stack2Region } from "../lib/const";
import { Stack1 } from "../lib/stack1";
import { Stack2 } from "../lib/stack2";

const app = new cdk.App();
cdk.Tags.of(app).add("Project", projectName);

const stack1 = new Stack1(app, "stack1", {
	stackName: `${projectName}-stack1`,
	env: { region: stack1Region },
});
const stack2 = new Stack2(app, "stack2", {
	stackName: `${projectName}-stack2`,
	env: { region: stack2Region },
});
stack2.addDependency(stack1);
