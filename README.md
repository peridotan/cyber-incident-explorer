# Cyber Incident Explorer v0.5.28

架空の企業システム構成図を見ながら、サイバー攻撃の進行、対策の作用点、効果の限界を学ぶ日本語のWeb教材です。

**公開サイト:** [Cyber Incident Explorer](https://peridotan.github.io/cyber-incident-explorer/)  
**ソースZIP:** [cyber-incident-explorer-v0.5.28.zip](https://peridotan.github.io/cyber-incident-explorer/cyber-incident-explorer-v0.5.28.zip)

## 収録シナリオ

- ランサムウェア（リモートアクセス経由）
- ランサムウェア（悪性メール添付経由）
- フィッシングからのSaaS侵害
- サプライチェーン攻撃（委託先・保守接続経由）
- サプライチェーン攻撃（正規ソフトウェア更新経由）
- 公開WebアプリケーションへのSQLインジェクション
- **DDoS／サービス停止（05、新規）**

## 学習の進め方

1. シナリオを選び、対策をOFFにして攻撃を最後まで実行します。
2. 完了後の「対策を変えて比較」を押し、対策を選んで再実行します。
3. 前回と今回の結果を比べ、「解説」で作用範囲と限界を確認します。

## v0.5.28の変更

- 05「DDoS／サービス停止」を追加（学習シナリオ計7件）。L3/L4の大量通信による企業回線飽和と、正常利用者のサービス利用不能を6ステップで可視化。
- 上流のトラフィック洗浄、CDN／Anycast、WAF、アプリ側のレート制限、可用性監視の5対策を比較可能にしました。
- 上流の対策は今回の攻撃量・契約容量・経路の条件を満たす場合に限り阻止とし、WAF／レート制限／監視のみでは上流の回線飽和を阻止できないことを明示。
- 攻撃通信と正常利用者通信を区別し、阻止後の未到達経路は通過済みの赤線にしないようにしました。
- 公開サイトのHTMLソースを `index.html` として管理し、GitHub Actionsで配布用ZIPを組み立てる方式に変更（従来のv0.5.27のZIP.b64は履歴保持用に残します）。
- 06 BEC、07 内部不正／情報持ち出し、08 AIアプリへの攻撃は引き続き次期候補です。

**注記：** 本教材のDDoS防御結果は架空の固定条件で決まります。現実の攻撃量、ルーティング、対策サービスの容量・構成によって効果は異なり、個別製品の防御を保証しません。

**参考資料**
- [MITRE ATT&CK T1498（Network Denial of Service）](https://attack.mitre.org/techniques/T1498/)
- [MITRE ATT&CK T1498.001（Direct Network Flood）](https://attack.mitre.org/techniques/T1498/001/)
- [CISA：DDoSへの理解と対応](https://www.cisa.gov/resources-tools/resources/understanding-and-responding-distributed-denial-service-attacks)

## v0.5.27の変更

- 攻撃完了後に「対策を変えて比較」へ誘導し、対策タブを開くようにしました。
- 前回と今回の攻撃結果を並べ、対策の違いを比較できるようにしました。
- 「使い方」を3ステップ中心に整理しました。

## 重要な前提

本教材は条件を固定した教育用の決定論的シミュレーションです。実際の不正アクセス、マルウェア実行、外部通信は行いません。画面上の検知・阻止結果は、実製品の検知率や実環境での効果を保証するものではありません。

## GitHub Pages

静的なHTMLで構成されています。mainブランチへの更新時にGitHub ActionsがZIPを展開し、サイトとソースZIPを公開します。

## 利用・改良・改善提案

Cyber Incident Explorerは、学習目的での利用に加え、改良や新しいシナリオの提案も歓迎します。

- **使う:** [公開サイト](https://peridotan.github.io/cyber-incident-explorer/)からブラウザで学習できます。
- **改良する:** ソースを入手して自分の環境で改良できます。改変・再配布時は、適用されるライセンス条件を守ってください。
- **改善を提案する:** [Issues](https://github.com/peridotan/cyber-incident-explorer/issues)で、分かりにくい点、不具合、シナリオ案などをお知らせください。
- **変更を提案する:** Pull Requestを歓迎します。詳しくは[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

学習内容の正確性を重視するため、攻撃の成立条件・対策の作用点・限界を変更する場合は、根拠となる公開資料を添えてください。

## ライセンス

本リポジトリで著作権者が権利を有するソースコードと関連文書は、[MIT License](LICENSE)の条件で提供します。コピー、改変、再配布、商用利用が可能ですが、著作権表示とライセンス文面の保持が必要です。

第三者が権利を保有するライブラリ、画像、フォント等が含まれる場合は、それぞれの権利表示と利用条件が優先します。MIT Licenseは、第三者の権利を変更するものではありません。
