# Daily Floor

Daily Floor は、行動活性化・感情回避による先延ばし・低エネルギー日・睡眠を考慮した作業継続を支えるローカルファーストPWAです。

## 特徴

- データはブラウザ内の IndexedDB に保存
- GitHub Pages だけで動作
- 初回ロード後は対応ブラウザでオフライン起動
- 朝チェックインからエネルギー A/B/C/D/R を計算
- 状態に応じて通常/低エネルギー/floor/接触目標を提案
- 6段階カスケード、5分タイマー、休養ログ、睡眠ログ
- 週間レビュー、カウンセラー/主治医/業務共有 Markdown
- JSONバックアップ、CSV、`.ics` カレンダー出力

## 開発

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## GitHub Pages

既定の base は `/daily_floor/` です。別リポジトリ名にする場合はビルド時に指定します。

```bash
VITE_BASE_PATH=/your-repo/ npm run build
```

`.github/workflows/pages.yml` が `npm ci`、型チェック、テスト、ビルド、Pages deploy を実行します。GitHub 側で Pages の source を GitHub Actions に設定してください。

## バックアップ

ローカルデータはIndexedDBに保存されます。ブラウザや端末の都合で失われる可能性があるため、定期的に JSON バックアップを出力してください。永続ストレージ要求は削除リスクを下げますが、バックアップの代わりにはなりません。

## PWA通知の制限

PWA単体の通知は端末・ブラウザ・インストール状態に依存します。確実な時刻通知が必要な場合は `.ics` を出力してカレンダーに登録してください。

## 医療安全

このアプリは診断、服薬助言、治療判断を行いません。出力するのは事実ログ、共有候補、中立的な変化メモだけです。

## 引き継ぎ

設計意図と別アプリへの応用は [docs/handoff.md](docs/handoff.md) にまとめています。
