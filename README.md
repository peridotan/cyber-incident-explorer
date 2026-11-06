# Cyber Incident Explorer v0.5.26

架空の企業システム構成図を見ながら、サイバー攻撃の進行、対策が働く場所、対策の限界を学ぶ日本語のWeb教材です。

**公開サイト:** [Cyber Incident Explorer](https://peridotan.github.io/cyber-incident-explorer/)  
**ソースZIP:** [cyber-incident-explorer-v0.5.26.zip](https://peridotan.github.io/cyber-incident-explorer/cyber-incident-explorer-v0.5.26.zip)

## 収録シナリオ

- ランサムウェア（リモートアクセス経由）
- ランサムウェア（悪性メール添付経由）
- フィッシングからのSaaS侵害
- サプライチェーン攻撃（委託先・保守接続経由）
- サプライチェーン攻撃（正規ソフトウェア更新経由）
- 公開WebアプリケーションへのSQLインジェクション

## 学習の進め方

1. シナリオを選び、対策をOFFにして攻撃の流れを確認します。
2. 対策を有効にして再実行し、どの地点で結果が変わるかを比べます。
3. 「解説」で対策の作用範囲と限界を確認します。

## 重要な前提

この教材は、条件を固定した教育用の決定論的シミュレーションです。実際の不正アクセス、マルウェア実行、外部通信は行いません。画面上の検知・阻止結果は、実製品の検知率や実環境での効果を保証するものではありません。

## GitHub Pages

静的なHTML、CSS、JavaScriptで構成され、サーバーやビルド環境を必要としません。mainブランチへの更新時にGitHub Actionsがサイトを公開します。
