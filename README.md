# cdk-cross-stack-reference2s

[heiwa4126/cdk-cross-stack-reference2: AWS CDKで複数スタック間で値を使いまわすサンプル。 同一ユーザで異なるリージョン。SSM パラメータ渡し版。](https://github.com/heiwa4126/cdk-cross-stack-reference2) を改造。

CDK の AwsCustomResource (中身は Lambda-backed custom resources) を使って
SSM パラメータから SSM の StringList Parameter Store で値を渡すようにしたバージョン。

利点:

- SSM パラメータだと 1 パラメータで 1 変数しか渡せないが、StringList なら複数渡せる。

欠点:

- インデックス番号のマッチング
- String store 同様全部で 4KB
- 1 要素 1KB 以内

## スタックの内容

1 個のユーザで

- stack1 で ap-northeast-1 に DynameDB を 1 個つくる。
- stack2 で ap-northeast-3 に、その DynameDB の ARN を outputs に出す。

非実用的だが、シンプルではある。

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

[元のレポジトリのメモ](https://github.com/heiwa4126/cdk-cross-stack-reference2?tab=readme-ov-file#%E3%83%A1%E3%83%A2)
以下も参照。

今回気づいたのは
AwsCustomResource は SDK 丸投げ汎用 lambda なので、
TypeScript の補完が役立たないこと。

AWS API 見ながら書くこと。
今回は
[GetParameters - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html)(SSM GetParameters)
の

- [Request Syntax](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html#API_GetParameters_RequestSyntax)
- [Response Syntax](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html#API_GetParameters_ResponseSyntax)

を参照した。
