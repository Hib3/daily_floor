import { Card } from "../components/Fields";

export function GuidePage() {
  return (
    <div className="stack">
      <Card title="はじめての使い方">
        <ol className="guide-list">
          <li>朝か作業前に「チェックイン」を押します。</li>
          <li>いまの眠気・気分・不安・身体の重さをざっくり入れます。</li>
          <li>「今日」に戻ると、今の状態に合った小さい目標が出ます。</li>
          <li>タスクの「開始」を押します。重ければ途中で「開くだけ」や「休養ログ」に進めます。</li>
          <li>夜に「夜レビュー」を押して、明日のfloorを1つだけ決めます。</li>
        </ol>
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
