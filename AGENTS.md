# Daily Floor 開発ルール

- 日本語で簡潔に回答する。不明点は推測せず「不明」と書く。
- Daily Floor は GitHub Pages-only PWA。バックエンド、サーバー処理、Firebase、Supabase、外部DB、外部分析、外部ログは禁止。
- ユーザーデータは IndexedDB にだけ保存し、明示的なエクスポート以外でブラウザ外へ出さない。
- React / TypeScript / Vite / PWA / Service Worker / IndexedDB を使う。重めの集計やレポート生成は Web Worker を優先する。
- GitHub Pages 互換の hash routing と configurable Vite base を維持する。
- 初回ロード後にオフラインで開ける構成を保つ。PWA通知は不確実と明記し、確実な時刻通知は `.ics` 出力を主手段にする。
- UIは日本語、非羞恥、低負荷、モバイルファーストにする。
- procrastination を怠惰ではなく感情回避として扱う。UIでは「床」ではなく「floor」と書く。floor、接触だけ、休養ログはいずれも有用な成功/データとして扱う。
- 睡眠不足や低エネルギー時は目標を下げる。通常量を押し付けない。
- 医療診断、服薬助言、治療判断、躁/うつ等の断定は禁止。出せるのは事実ログ、共有候補、中立フラグだけ。
- 変更は最小差分にし、主要ロジックにはテストを追加する。
