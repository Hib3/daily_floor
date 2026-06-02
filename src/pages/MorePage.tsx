import { Card } from "../components/Fields";

const steps = [
  ["今日", "目的を選ぶ", "今日の1歩を完了すると、達成ログがその場で保存されます。"],
  ["記録", "日記を書く", "右下の「＋記録」やクイックボタンから、本文・気分・写真・休養を保存します。"],
  ["振り返り", "次の1歩を決める", "目的カードの「振り返る」から、予定・実際・学び・次の1歩を残します。"],
  ["ジャーナル", "時系列で見る", "リストは新しい順、カレンダーは記録がある日、目的タブは達成と振り返りを見ます。"]
];

const methods = [
  ["小さい1歩", "重い日は通常量を下げ、floorアクションだけを保存します。"],
  ["もし/その時は", "迷う場面と次の行動を先に結び、開始時の迷いを減らします。"],
  ["行動の記録", "気分が整ってから動く前提ではなく、できた行動と環境を事実として残します。"],
  ["AAR型振り返り", "予定、実際、理由、次に変えることを短く見ます。責めるためではありません。"],
  ["睡眠と生活リズム", "睡眠や活動量の変化は断定せず、共有候補として記録します。"]
];

export function MorePage() {
  return (
    <div className="screen more-screen">
      <header className="hero glass-hero">
        <div>
          <h1>More</h1>
          <p>ガイド、バックアップ、設定</p>
        </div>
      </header>

      <Card title="ユーザーガイド">
        <p>Daily Floorは、目的を作り、今日の1歩を保存し、振り返り、日記として時系列で見返すPWAです。</p>
        <div className="guide-flow">
          {steps.map(([title, action, result]) => (
            <article className="guide-step glass-panel" key={title}>
              <div className="guide-mini">
                <span>{title}</span>
                <strong>{action}</strong>
              </div>
              <p>{result}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card title="ボタンで起きること">
        <dl className="plain-dl">
          <div><dt>今日の1歩を完了</dt><dd>目的の達成回数を増やし、同じ内容をジャーナルに保存します。画面内に保存メッセージが出ます。</dd></div>
          <div><dt>振り返る</dt><dd>目的の振り返り画面へ移動します。保存するとTodayへ戻り、ジャーナルにも残ります。</dd></div>
          <div><dt>＋記録</dt><dd>目的とは別に日記・状態・写真・休養ログを作る編集画面へ移動します。</dd></div>
          <div><dt>ジャーナルの目的タブ</dt><dd>目的ごとの達成回数、振り返り回数、最近のイベントを確認します。</dd></div>
        </dl>
      </Card>

      <Card title="取り入れた考え方">
        <div className="method-list">
          {methods.map(([title, text]) => (
            <article className="method-card" key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className="small-text">このアプリは医療診断、服薬助言、治療判断を行いません。記録、共有候補、生活上の次の1歩だけを扱います。</p>
      </Card>

      <Card title="参考資料">
        <ul className="reference-list">
          <li><a href="https://cancercontrol.cancer.gov/brp/research/constructs/implementation-intentions">Implementation Intentions - NIH/NCI</a></li>
          <li><a href="https://www.ncbi.nlm.nih.gov/books/NBK74846/">Behavioral activation treatments of depression - NCBI Bookshelf</a></li>
          <li><a href="https://www.armyupress.army.mil/Journals/Journal-of-Military-Learning/Journal-of-Military-Learning-Archives/April-2022/Cates-Action-Review/">Improving After Action Review - Army University Press</a></li>
          <li><a href="https://www.nice.org.uk/guidance/cg185/chapter/1-Guidance">Bipolar disorder: assessment and management - NICE</a></li>
          <li><a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/">Sleep routine guidance - NHS</a></li>
        </ul>
      </Card>

      <div className="settings-list">
        <a href="#/backup">バックアップ</a>
        <a href="#/settings">設定</a>
        <a href="#/journal?view=calendar">カレンダーを見る</a>
      </div>
    </div>
  );
}

