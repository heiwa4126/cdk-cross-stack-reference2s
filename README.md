# cdk-cross-stack-reference1

複数スタック間で値を使いまわすサンプル。
同一ユーザ同一リージョン版。

## スタックの内容

1 個のユーザの同一リージョンに

- stack1 で DynameDB を 1 個つくる。
- stack2 でその DynameDB の ARN を outputs に出す。

## 準備

```
cp .env.template .env
```

して、 `.env` に AWS CLI プロファイル名を書く。
stack はこのプロファイルのデフォルトリージョンに作成される。

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

**同一ユーザ同一リージョンなら**、データ渡しに

- `cdk.CfnOutput()` の `exportName` - [class CfnOutput (construct) · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.CfnOutput.html#exportname)
- `cdk.Fn.importValue()` - [class Fn · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Fn.html#static-importwbrvaluesharedvaluetoimport)

が使える。
