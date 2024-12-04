# cdk-cross-stack-reference2s

複数スタック間で値を使いまわすサンプル。
同一ユーザで異なるリージョン。

CDK の AwsCustomResource (中身は Lambda-backed custom resources) を使って
SSM パラメータ渡し版。

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

AwsCustomResource は
[Lambda を使用するカスタムリソース - AWS CloudFormation](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/template-custom-resources-lambda.html)
のラッパーで、実体は "Lambda-backed custom resources" というもの。

AWS 公式の説明はよくわからないので、以下参照。
[Cloudformationのカスタムリソースについて簡単解説 #AWS - Qiita](https://qiita.com/deask/items/dd61c66f893ac114252f)

### 今回のカスタムリソースの使い方でダメなところ

physicalResourceId を毎回更新しないと値を見に行ってくれない。
つまり
`cdk diff` で stack2 のほうは毎回 diff ありになるし、
`cdk deploy` で stack2 は毎回デプロイされる。

元の SSM パラメータに変更がないばあいは
カスタムリソース 1 個が更新対象になるだけなので、
重い処理ではないのだけど、気持ちが悪い。

もし、「スタック間で物理 ID や ARN をあらかじめ決め打ち」で解決できるなら、そのほうがいい。

「スタック 1 を作って、その Outputs を AWS CLI で取って、それをスタック 2 に与える」みたいなことをやってるなら、
今回のように AwsCustomResource を使うほうがいいと思う。

### メモ: CfnOutputでもできるらしい

たぶん SSM パラメータよりいいのでは?
(SSM パラメータはユーザ+リージョンのリソースで、他とぶつかるかもしれない)。

と思ったんだけどうまくいかなかった。
[DescribeStacks - AWS CloudFormation](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/APIReference/API_DescribeStacks.html) の戻り値が

[getResponseField\(dataPath\)](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsCustomResource.html#getwbrresponsewbrfielddatapath)も getResponseFieldReference(dataPath)も
リーフノードしか取得できない。

- NG: getResponseField("Stacks.0.Outputs");
- OK: getResponseField("Stacks.0.Outputs.0.OutputValue");

(getResponseField()は CFn で Fn::GetAtt になる)

AwsCustomResource では扱いかねるので、自前で Lambda を書くしかない
(めんどくさくて挫折中。参考: [cfn-response モジュール - AWS CloudFormation](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html#cfn-lambda-function-code-cfnresponsemodule-source-nodejs))。

### AwsCustomResource の tips

`lib/stack2.ts` の getParameter、いまは 1 個だけ SSM パラメータを取得しているけど、
getParameter のかわりに getParameters を使えば
onUpdate.parameters.Name にリストを指定できる。
[getParameters() - Class: AWS.SSM — AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#getParameters-property)

SSM パラメータが複数ある場合は楽だと思う。

ssm.StringListParameter()で書いて、get-parameter**s** で取るらしい。試す。

いずれにしても SSM パラメータはサイズ制限があって:

- String パラメータ: 最大サイズは 4KB。
- StringList パラメータ: こちらも同様に、合計で 4KB、リスト内の各要素は最大 1KB まで。

## おまけ: CDK for Terraform(CDKTF)

CDKTF だと

1. Terraform の Remote State を利用する
2. SSM パラメータを利用する (今回と同じ)
3. AWS Resource Access Manager(RAM)を利用。(使えるリソースが超限定される)

どの手法でも AWS CDK よりずっと楽に書けるらしい。
