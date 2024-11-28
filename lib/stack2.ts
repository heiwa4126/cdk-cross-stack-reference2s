import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import { projectName } from "./const";

export class Stack2 extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// インポート
		const tableArn = cdk.Fn.importValue(`${projectName}-TableArn`);

		new cdk.CfnOutput(this, "Stack1TableArnOutput", {
			value: tableArn,
		});
	}
}
