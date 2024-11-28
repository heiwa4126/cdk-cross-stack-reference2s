import * as cdk from "aws-cdk-lib";
import {
	AwsCustomResource,
	AwsCustomResourcePolicy,
	PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import type { Construct } from "constructs";
import { ssmTableArn, stack1Region } from "./const";

export class Stack2 extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// AwsCustomResourceを使用してパラメータを1個取得
		// これ実体はlambda
		const getParameter = new AwsCustomResource(this, "GetParameter", {
			onUpdate: {
				service: "SSM",
				action: "getParameter",
				parameters: {
					Name: ssmTableArn,
				},
				region: stack1Region, // パラメータが存在するリージョン
				physicalResourceId: PhysicalResourceId.of("GetParameter"), // 常に最新の値を取得
			},
			policy: AwsCustomResourcePolicy.fromSdkCalls({
				resources: AwsCustomResourcePolicy.ANY_RESOURCE,
			}),
		});

		// パラメータの値を取得
		const tableArn = getParameter.getResponseField("Parameter.Value");

		new cdk.CfnOutput(this, "Stack1TableArnOutput", {
			value: tableArn,
		});
	}
}
