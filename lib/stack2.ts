import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import {
	AwsCustomResource,
	AwsCustomResourcePolicy,
	PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import type { Construct } from "constructs";
import { ssmStack1parameters, stack1Region } from "./const";

export class Stack2 extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// AwsCustomResourceを使用してパラメータを取得
		// このへん補完がまるで効かないので注意。
		const getParameters = new AwsCustomResource(this, "GetParameters", {
			onUpdate: {
				service: "SSM",
				action: "getParameters",
				parameters: {
					// see https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html#API_GetParameters_RequestParameters
					Names: [ssmStack1parameters],
				},
				region: stack1Region, // パラメータが存在するリージョン
				// physicalResourceId: PhysicalResourceId.of("GetParameter"),
				physicalResourceId: PhysicalResourceId.of(Date.now().toString()), // 毎回新しい値を取得
			},
			policy: AwsCustomResourcePolicy.fromSdkCalls({
				resources: AwsCustomResourcePolicy.ANY_RESOURCE, // さすがにガバガバすぎ
				// resources: [
				// 	`arn:${cdk.Aws.PARTITION}:ssm:${stack1Region}:${this.account}:parameter/${projectName}/*`,
				// 	// .fromSdkCalls()を使うと↑のserviceとactionから↓で書いたポリシーを生成してくれる。
				// ],
			}),
			// policy: AwsCustomResourcePolicy.fromStatements([
			// 	new cdk.aws_iam.PolicyStatement({
			// 		actions: ["ssm:GetParameter"],
			// 		resources: [
			// 			`arn:${cdk.Aws.PARTITION}:ssm:${stack1Region}:${this.account}:parameter/${projectName}/*`,
			// 		],
			// 		effect: cdk.aws_iam.Effect.ALLOW,
			// 	}),
			// ]),
			logGroup: new logs.LogGroup(this, "GetParameterLogGroup", {
				// ちゃんとロググループを作らないと、cdk destoryで消えない。
				retention: logs.RetentionDays.ONE_WEEK,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			}),
			installLatestAwsSdk: false,
			//↑ https://dev.classmethod.jp/articles/parameter-store-across-regions-with-aws-cdk-custom-resource/#installlatestawssdk-%25E3%2583%2597%25E3%2583%25AD%25E3%2583%2591%25E3%2583%2586%25E3%2582%25A3%25E3%2581%25AF-false-%25E3%2581%25AB%25E8%25A8%25AD%25E5%25AE%259A%25E3%2581%2597%25E3%2581%259F%25E6%2596%25B9%25E3%2581%258C%25E8%2589%25AF%25E3%2581%2595%25E3%2581%259D%25E3%2581%2586
		});

		// パラメータの値を取得
		// see: https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html#API_GetParameters_ResponseSyntax
		const tableArn = getParameters.getResponseField("Parameters.0.Value");

		new cdk.CfnOutput(this, "Stack1TableArnOutput", {
			value: tableArn,
		});
	}
}
