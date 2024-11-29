import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import type { Construct } from "constructs";
import { projectName, ssmTableArn } from "./const";

export class Stack1 extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const table = new dynamodb.Table(this, "MyTable", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			tableName: `${projectName}-table`,
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // 無料枠内の利用
			removalPolicy: cdk.RemovalPolicy.DESTROY, // スタックをdestroyしたときにテーブルを削除
		});

		// SSMパラメータにtableArnを書き込む
		new ssm.StringParameter(this, "SSMTableArn", {
			parameterName: ssmTableArn,
			stringValue: table.tableArn,
		});
	}
}
