import { Card } from "../components/Fields";

const guideImages = [
  ["今日", `${import.meta.env.BASE_URL}guide/today.jpg`, "Todayは、その日の入口。クイック作成と今日のログを置く。"],
  ["ジャーナル一覧", `${import.meta.env.BASE_URL}guide/journal-list.jpg`, "リストは新しい順。月見出しと日付で流れを追える。"],
  ["カレンダー", `${import.meta.env.BASE_URL}guide/journal-calendar.jpg`, "カレンダーは記録の有無を俯瞰する。空白を責める画面にしない。"],
  ["編集", `${import.meta.env.BASE_URL}guide/editor.jpg`, "編集画面は本文に集中。写真や添付は補助導線にする。"],
  ["More", `${import.meta.env.BASE_URL}guide/more.jpg`, "Moreはガイド、バックアップ、設定など迷った時の場所。"]
];

export function MorePage() {
  return (
    <div className="screen more-screen">
      <header className="hero">
        <div>
          <h1>More</h1>
          <p>ガイド、バックアップ、設定</p>
        </div>
      </header>

      <Card title="ユーザーガイド">
        <p>Daily Floor Lifeは、長い日記だけでなく、1行、気分、写真、添付、休養ログを時系列で残すPWAです。</p>
        <div className="guide-gallery">
          {guideImages.map(([title, src, text]) => (
            <figure key={title}>
              <img src={src} alt={`${title}画面の参考スクリーンショット`} />
              <figcaption><strong>{title}</strong><span>{text}</span></figcaption>
            </figure>
          ))}
        </div>
      </Card>

      <Card title="使い方">
        <ol className="guide-list">
          <li>今日画面で、今できる入口を選びます。</li>
          <li>＋またはクイックボタンから、1行・気分・写真・休養ログを保存します。</li>
          <li>ジャーナルで、上から下へ新しい順に見返します。</li>
          <li>カレンダーで、どの日に記録があるか確認します。</li>
          <li>Moreからバックアップを出します。</li>
        </ol>
      </Card>

      <Card title="ヘルスケアの約束">
        <p>書けない日、短い日、休む日は失敗ではありません。診断、服薬助言、治療判断は行いません。残すのは事実ログと共有候補だけです。</p>
      </Card>

      <div className="settings-list">
        <a href="#/backup">バックアップ</a>
        <a href="#/settings">設定</a>
        <a href="#/journal?view=calendar">カレンダーを見る</a>
      </div>
    </div>
  );
}
