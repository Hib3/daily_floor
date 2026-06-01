# Daily Floor Product Spec

Daily Floor は「先延ばしは怠惰ではなく感情回避として扱う」ことを中心原則にする。床レベルの行動、接触だけ、休養ログを失敗扱いせず、睡眠不足や低エネルギー時は通常目標から下げる。

主要機能:

- 朝チェックインとエネルギー判定 A/B/C/D/R
- タスクごとの normal / low-energy / floor / contact goal
- 感情ラベル、if-then、報酬バンドル、5分タイマー、開くだけ、休養ログの6段階カスケード
- 睡眠、昼寝、カフェインの事実ログ
- 夜レビュー
- Web Worker を使った週間集計と共有用 Markdown
- JSON/CSV/Markdown/ICS エクスポート
- IndexedDBローカル保存、PWAオフライン対応

禁止:

- 外部DB、外部分析、外部ログ
- 診断、服薬助言、治療判断
- 恥や失敗を強める表現
