'use client';

import { useState } from 'react';
import { Settings, Save, RefreshCcw, Download, Upload } from 'lucide-react';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultCategory: string;
  defaultPriority: 'low' | 'medium' | 'high';
  autoSave: boolean;
  notificationsEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    defaultCategory: '一般',
    defaultPriority: 'medium',
    autoSave: true,
    notificationsEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 設定を保存する処理
    localStorage.setItem('memoAppSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('設定をリセットしますか？')) {
      setSettings({
        theme: 'light',
        defaultCategory: '一般',
        defaultPriority: 'medium',
        autoSave: true,
        notificationsEnabled: true,
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'memo-app-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings({ ...settings, ...importedSettings });
        } catch {
          alert('設定ファイルの読み込みに失敗しました');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-full">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        </div>
        <p className="text-gray-600">アプリケーションの設定を管理できます</p>
      </div>

      {/* 設定フォーム */}
      <div className="space-y-6">
        {/* 外観設定 */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">外観</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テーマ
              </label>
              <select
                value={settings.theme}
                onChange={e =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as 'light' | 'dark' | 'system',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="system">システム設定に従う</option>
              </select>
            </div>
          </div>
        </div>

        {/* デフォルト設定 */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            デフォルト設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                デフォルトカテゴリ
              </label>
              <input
                type="text"
                value={settings.defaultCategory}
                onChange={e =>
                  setSettings({ ...settings, defaultCategory: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                デフォルト優先度
              </label>
              <select
                value={settings.defaultPriority}
                onChange={e =>
                  setSettings({
                    ...settings,
                    defaultPriority: e.target.value as
                      | 'low'
                      | 'medium'
                      | 'high',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
        </div>

        {/* 動作設定 */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">動作設定</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  自動保存
                </label>
                <p className="text-sm text-gray-500">
                  入力内容を自動的に保存します
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, autoSave: !settings.autoSave })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  通知
                </label>
                <p className="text-sm text-gray-500">
                  重要な更新について通知を受け取ります
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: !settings.notificationsEnabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationsEnabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* データ管理 */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            データ管理
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                設定をエクスポート
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  設定をインポート
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 設定の保存・リセット */}
        <div className="flex items-center justify-between bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            設定をリセット
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? '保存しました' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
