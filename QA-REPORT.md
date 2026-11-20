# Cyber Incident Explorer v0.5.30 — QAレポート

検証日：2026-11-20
対象：CASE 05「DDoS／サービス停止」のステップ別着色・正常通信矢印、および既存6シナリオ
検証方法：ローカルHTMLに対するChromium / Playwright操作。実攻撃・実通信なし。

## 修正前の原因
- 公開Webの状態は`nodePresentation()`でSTEP 05（index 4）まで中立表示になっていた。回線飽和がSTEP 03（index 2）で確定しても赤くならない。
- 正常通信の青いSVGマーカーだけ`markerUnits`の指定がなく、初期値`strokeWidth`で線幅に応じて矢印が拡大していた。

## 修正内容
- **OFF：** STEP 01〜02はWeb影響未判定、STEP 03で回線飽和が確定すると公開Webが赤色に変化。その後のステップでも赤を維持。
- **ON：** STEP 03では公開Webの赤色を防止し、STEP 04で正常通信を確認すると緑色、STEP 05で「正常アクセス可能」を表示。
- STEP 03のOFFでは結果概要にも「公開Webへのアクセスに影響」を示し、結果一覧の公開Web行にも「利用困難（回線飽和）」を表示。
- 正常通信の青い矢印は`markerUnits="userSpaceOnUse"`で9×8に固定し、公開Webのノード境界との間に余白を確保。
- 赤色はサーバー侵害ではなく**接続回線の飽和による可用性影響**を示す。

## テスト結果（ローカル）
| 確認項目 | 期待結果 | 判定 |
|---|---|---|
| DDoS OFF STEP 02 | Webはまだ影響未判定 | PASS |
| DDoS OFF STEP 03 | Webが赤色・回線飽和による利用困難 | PASS |
| DDoS OFF STEP 04〜06 | Webの赤色を継続 | PASS |
| DDoS ON STEP 03 | Webが赤色にならない | PASS |
| DDoS ON STEP 04 | Webが緑色・正常通信到達 | PASS |
| DDoS ON STEP 05〜06 | Webが緑色・正常アクセス可能 | PASS |
| 青矢印マーカー | userSpaceOnUse、9×8、Web手前で終端 | PASS |
| 対策ON/OFFの比較・全初期化 | 履歴・図の初期化が整合 | PASS |
| 既存6シナリオ | 全件再生、JavaScript例外なし | PASS |
| HTML内JavaScript | 12個のスクリプトすべて構文検証合格 | PASS |
| 1686×900 / 1366×768 | 基本表示と青線・赤色を目視確認 | PASS |

## 留保
- ローカル環境でのテストであり、GitHub Pages公開後の確認は未実施。
- 実機モバイル・すべてのテーマ／文字倍率・スクリーンリーダーの網羅的検証は未実施。
- 本教材のDDoS緩和結果は固定の攻撃量・保護経路・処理容量を仮定した例であり、現実の防御成功率を保証しません。

公開判定：ローカルテスト合格。レビュー後にmainへ反映し、GitHub Actions・公開ページを確認すること。
