import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";
import { projectName } from "./const";

export class Stack1 extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const table = new dynamodb.Table(this, "MyTable", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			tableName: `${projectName}-table`,
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // 無料枠内の利用
		});

		// エクスポート
		new cdk.CfnOutput(this, "TableArnOutput", {
			value: table.tableArn,
			exportName: `${projectName}-TableArn`,
		});
	}
}
