import { Card } from "../components/Fields";

export function GuidePage() {
  return (
    <div className="stack">
      <Card title="はじめての使い方">
        <p className="lead">入口は「チェックイン」だけではありません。</p>
        <p>起床時ではない、入力する気力がない、何から始めるか決まっていない時は、チェックインを飛ばして大丈夫です。</p>
        <div className="button-row">
          <a className="button primary" href="#/cascade">今あるタスクを開始</a>
          <a className="button" href="#/today">今日の画面へ</a>
          <a className="button" href="#/tasks">タスクを追加</a>
        </div>
      </Card>

      <Card title="状況別の入口">
        <dl className="plain-dl">
          <div>
            <dt>今の状態を軽く入れられる</dt>
            <dd>「状態メモ」を押します。睡眠や起床時刻が不明なら空欄でOKです。</dd>
          </div>
          <div>
            <dt>もうタスクに触れたい</dt>
            <dd>「開始」を押します。感情確認から始まり、重ければ途中で「開くだけ」や「休養ログ」に進めます。</dd>
          </div>
          <div>
            <dt>開くだけならできそう</dt>
            <dd>Today画面の「接触できた」を押します。作業時間が0秒でも記録できます。</dd>
          </div>
          <div>
            <dt>今日は無理そう</dt>
            <dd>「休養ログ」を押します。失敗ではなく、あとで傾向を見るための記録です。</dd>
          </div>
          <div>
            <dt>使いたい対象がない</dt>
            <dd>「タスクを追加」で、家事・連絡・手続き・勉強・体調管理などを1つ追加します。</dd>
          </div>
        </dl>
      </Card>

      <Card title="言葉の意味">
        <dl className="plain-dl">
          <div>
            <dt>floor</dt>
            <dd>今日はここまでできたら十分、という最低ラインです。例: ページを開く、メモを見る、洗濯物を1つだけ拾う。</dd>
          </div>
          <div>
            <dt>接触</dt>
            <dd>作業そのものを進めなくても、対象に触れた状態です。開いただけ、見ただけでも記録できます。</dd>
          </div>
          <div>
            <dt>休養ログ</dt>
            <dd>今日は動けなかった理由を残す記録です。失敗ではなく、後でパターンを見るためのデータです。</dd>
          </div>
          <div>
            <dt>カスケード</dt>
            <dd>重いタスクを、感情確認、きっかけ、報酬、5分、開くだけ、休養ログの順に小さくする画面です。</dd>
          </div>
        </dl>
      </Card>

      <Card title="生活全般で使う例">
        <ul className="guide-list">
          <li>家事: 洗濯機を開くだけ、皿を1枚だけ流しに置く。</li>
          <li>連絡: 相手の名前を見るだけ、下書きを1行だけ作る。</li>
          <li>手続き: 必要書類のページを開くだけ、期限だけ確認する。</li>
          <li>勉強/仕事: 資料を開くだけ、1段落だけ読む。</li>
          <li>体調管理: 睡眠時間だけ入れる、休養ログだけ残す。</li>
        </ul>
        <a className="button primary" href="#/tasks">生活タスクを追加する</a>
      </Card>

      <Card title="このアプリがしないこと">
        <p>診断、服薬助言、治療判断はしません。記録と共有用メモだけを作ります。</p>
      </Card>
    </div>
  );
}
