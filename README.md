# cdk-cross-stack-reference2

複数スタック間で値を使いまわすサンプル。
同一ユーザで異なるリージョン。SSM パラメータ渡し版。

## スタックの内容

1 個のユーザで

- stack1 で ap-northeast-1 に DynameDB を 1 個つくる。
- stack2 で ap-northeast-3 に、その DynameDB の ARN を outputs に出す。

## 準備

```
cp .env.template .env
```

して、 `.env` に AWS CLI プロファイル名を書く。

## 実行

```sh
pnpm i
pnpm run bootstrap
pnpm run deploy
```

終わったら

```sh
pnpm run destory
```

で破棄。

## メモ

同一リージョンでないので、データ渡しに
`cdk.CfnOutput()` の `exportName` / `cdk.Fn.importValue()`
が使えない。

ここでは
AwsCustomResource を使って SSM パラメータ渡しにしている。
SSM パラメータ、リソースとして管理されるので、ちゃんと destroy される。

AwsCustomResource で引っ張ってこれるものは:

- [class AwsCustomResource (construct) · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsCustomResource.html)
- [interface AwsSdkCall · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsSdkCall.html)

要するに「ほぼ何でもできる」みたい。

今回使った SSM の getParameter はこれ。

- [getParameter - Class: AWS.SSM — AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#getParameter-property)
- [GetParameter - AWS Systems Manager](https://docs.aws.amazon.com/ja_jp/systems-manager/latest/APIReference/API_GetParameter.html)

**CfnOutput でもできるらしい。**
たぶん SSM パラメータよりいい。
(SSM パラメータはユーザ+リージョンのリソースで、他とぶつかるかもしれない)。

## AwsCustomResource の tips

- [カスタムリソースを使用してカスタムプロビジョニングロジックを作成する - AWS CloudFormation](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/template-custom-resources.html)

`lib/stack2.ts` の getParameter、いまは 1 個だけ SSM パラメータを取得しているけど、
getParameter のかわりに getParameters を使えば
onUpdate.parameters.Name にリストを指定できる。
[getParameters() - Class: AWS.SSM — AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#getParameters-property)
