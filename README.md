# Daily Floor

Daily Floor は、目的作成、今日の1歩の達成、振り返り、日記タイムラインをまとめるローカルファーストPWAです。

長文の日記を書くことだけをゴールにせず、目的に少し触れる、1行だけ書く、気分だけ残す、休養ログを残すことも同じように記録できます。書けない日や休む日を失敗として扱いません。

## Features

- 今日画面: 今日の目的、1歩の達成、クイック記録、今日のタイムライン
- 目的画面: 目的作成、floorアクション、もし/その時は、振り返り
- ジャーナル画面: リスト、カレンダー、メディア、目的履歴
- More画面: 実アプリに一致するユーザーガイド、設定、バックアップ、参考資料
- 新規ログ: 日記、気分、写真、添付、状態、休養、後で書く
- IndexedDB local-first storage
- JSON/CSV/ICS export
- GitHub Pages-only PWA
- Offline app shell after first load

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## GitHub Pages

既定の base は `/daily_floor/` です。

```bash
VITE_BASE_PATH=/daily_floor/ npm run build
```

GitHub Pages は `.github/workflows/pages.yml` で Actions deploy します。

## Privacy

- データはブラウザ内の IndexedDB に保存
- 外部DBなし
- 外部分析なし
- 外部ログなし
- 自動アップロードなし
- ユーザーが明示的にエクスポートしたファイルだけがブラウザ外に出ます

## Healthcare Safety

このアプリは診断、服薬助言、治療判断を行いません。出力するのは事実ログ、共有候補、中立的な変化メモだけです。

## Handoff

設計意図と別アプリへの応用は [docs/handoff.md](docs/handoff.md) にまとめています。
