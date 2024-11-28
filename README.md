# cdk-cross-stack-reference2

複数スタック間で値を使いまわすサンプル。
同一ユーザで異なるリージョン版。

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

AwsCustomResource を使って SSM パラメータ渡しにする。(CfnOutput でもできるらしい)。
SSM パラメータ、ちゃんと destroy されるのがすごい。

## AwsCustomResource の tips

- [aws-cdk-lib.custom_resources module · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html)
- [カスタムリソースを使用してカスタムプロビジョニングロジックを作成する - AWS CloudFormation](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/template-custom-resources.html)

`lib/stack2.ts` の getParameter、いまは 1 個だけ SSM パラメータを取得しているけど、
getParameter のかわりに getParameters を使えば
onUpdate.parameters.Name にリストを指定できる。
