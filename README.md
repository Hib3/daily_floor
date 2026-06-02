# Daily Floor Life

Daily Floor Life は、日記・気分・写真・添付・休養ログを時系列で残すローカルファーストPWAです。

長文の日記を書くことだけをゴールにせず、1行だけ、気分だけ、写真だけ、後で書く枠、休養ログも同じように記録できます。ヘルスケアの考え方として、書けない日や休む日を失敗として扱いません。

## Features

- 今日画面: クイック作成、今日のタイムライン、ヘルスケア意図
- ジャーナル画面: リスト、カレンダー、メディア表示
- More画面: スクリーンショット付きユーザーガイド、設定、バックアップ
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
