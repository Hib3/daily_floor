import { useEffect, useState } from "react";
import { Card } from "../components/Fields";
import { clearAllLocalData, db, seedIfNeeded } from "../lib/db";
import { requestNotifications } from "../lib/notifications";

export function SettingsPage() {
  const [storage, setStorage] = useState("確認中");
  const [persisted, setPersisted] = useState("不明");
  const [notification, setNotification] = useState<string>("Notification" in window ? Notification.permission : "非対応");

  useEffect(() => {
    Promise.all([
      navigator.storage?.estimate?.(),
      navigator.storage?.persisted?.()
    ]).then(([estimate, isPersisted]) => {
      setStorage(estimate ? `${Math.round((estimate.usage ?? 0) / 1024)} KB / ${Math.round((estimate.quota ?? 0) / 1024 / 1024)} MB` : "非対応");
      setPersisted(typeof isPersisted === "boolean" ? (isPersisted ? "許可済み" : "未許可") : "非対応");
    });
  }, []);

  async function persist() {
    if (!navigator.storage?.persist) {
      setPersisted("非対応");
      return;
    }
    const ok = await navigator.storage.persist();
    await db.settings.update("app", { persistentStorageRequested: true, updatedAt: new Date().toISOString() });
    setPersisted(ok ? "許可済み" : "未許可");
  }

  async function clearData() {
    if (!confirm("削除前にバックアップ出力を推奨します。すべてのローカルデータを削除しますか。")) return;
    await clearAllLocalData();
    await seedIfNeeded();
    location.hash = "#/today";
    location.reload();
  }

  return (
    <div className="stack">
      <Card title="PWA / オフライン">
        <p>初回読み込み後、対応ブラウザではアプリ本体がキャッシュされ、オフラインで開けます。ユーザーデータはCache StorageではなくIndexedDBに保存します。</p>
        <p>オフライン準備: Service Worker登録後に有効</p>
      </Card>
      <Card title="永続ストレージ">
        <p>ブラウザ都合の自動削除リスクを下げます。ただしバックアップは別途必要です。</p>
        <p>使用量: {storage}</p>
        <p>状態: {persisted}</p>
        <button className="primary" onClick={persist}>永続ストレージを要求</button>
      </Card>
      <Card title="通知">
        <p>PWA単体の通知は端末・ブラウザに依存します。確実な時刻通知はカレンダー出力を使ってください。</p>
        <p>通知状態: {notification}</p>
        <button onClick={() => requestNotifications().then((result) => setNotification(result))}>通知を許可する</button>
      </Card>
      <Card title="データ削除">
        <p>削除はこのブラウザ内のDaily Floorデータだけに作用します。復元にはJSONバックアップが必要です。</p>
        <button className="danger" onClick={clearData}>ローカルデータを削除</button>
      </Card>
    </div>
  );
}
