#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { projectName } from "../lib/const";
import { Stack1 } from "../lib/stack1";
import { Stack2 } from "../lib/stack2";

const app = new cdk.App();
// スタックグループにもできるけど、今回はしない
const stack1 = new Stack1(app, `${projectName}-stack1`, { env: { region: "ap-northeast-1" } });
const stack2 = new Stack2(app, `${projectName}-stack2`, { env: { region: "ap-northeast-3" } });
stack2.addDependency(stack1);
