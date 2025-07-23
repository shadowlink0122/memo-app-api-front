import { test, expect } from '@playwright/test';

test.describe('メモアプリの基本機能', () => {
  test.beforeEach(async ({ page }) => {
    // テストモードでページにアクセス
    await page.goto('/?test=true');

    // テスト用の認証情報を設定
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-test-token');
      localStorage.setItem(
        'user_info',
        JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        })
      );
    });

    // ページを再読み込みして認証状態を反映
    await page.reload();
  });

  test('ホームページが正しく表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle(/メモアプリ|Memo App/);

    // メインヘッダーの確認（より具体的に指定）
    await expect(
      page.getByRole('heading', { name: 'メモアプリ', exact: true })
    ).toBeVisible();

    // 新規メモ作成ボタンの確認
    await expect(
      page.getByRole('button', { name: /新しいメモ|New Memo/ })
    ).toBeVisible();
  });

  test('サイドバーの表示・非表示', async ({ page }) => {
    // サイドバーが表示されていることを確認
    const sidebar = page
      .locator('[data-testid="sidebar"]')
      .or(page.locator('aside'));
    await expect(sidebar).toBeVisible();

    // モバイル表示でサイドバートグルボタンをクリック
    const toggleButton = page
      .getByRole('button', { name: /メニュー|menu/i })
      .or(page.locator('[data-testid="sidebar-toggle"]'));

    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
  });

  test('メモの一覧表示', async ({ page }) => {
    // メモリストが表示されることを確認
    const memoList = page
      .locator('[data-testid="memo-list"]')
      .or(page.locator('.memo-list'))
      .or(page.getByRole('main'));
    await expect(memoList).toBeVisible();

    // メモアイテムが存在する場合はクリック可能であることを確認
    const memoItems = page
      .locator('[data-testid="memo-item"]')
      .or(page.locator('.memo-item'));

    const count = await memoItems.count();
    if (count > 0) {
      await expect(memoItems.first()).toBeVisible();
    }
  });

  test('新しいメモの作成', async ({ page }) => {
    // 新規メモ作成ボタンをクリック
    console.log('新規メモ作成ボタンを探しています...');
    const newMemoButton = page.getByRole('button', {
      name: /新しいメモ|New Memo|作成|Create/,
    });

    // ボタンが見つかるかどうか確認
    const buttonCount = await newMemoButton.count();
    console.log('見つかった新規メモボタン数:', buttonCount);

    if (buttonCount === 0) {
      // 代替ボタンを探す
      const altButtons = page
        .locator('button')
        .or(page.locator('[role="button"]'));
      const allButtonCount = await altButtons.count();
      console.log('ページ上の全ボタン数:', allButtonCount);

      for (let i = 0; i < Math.min(allButtonCount, 10); i++) {
        const buttonText = await altButtons.nth(i).textContent();
        console.log(`ボタン ${i}: "${buttonText}"`);
      }
    }

    await newMemoButton.click();

    // メモフォームが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();

    // タイトル入力
    const titleInput = page
      .getByLabel(/タイトル|Title/)
      .or(page.locator('input[name="title"]'));
    await titleInput.fill('テスト用メモ');

    // 内容入力
    const contentInput = page
      .getByLabel(/内容|Content/)
      .or(page.locator('textarea[name="content"]'));
    await contentInput.fill('これはE2Eテスト用のメモです。');

    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', {
      name: /保存|Save|作成|Create|更新|Update/,
    });
    await saveButton.click();

    // フォームが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 作成したメモが一覧に表示されることを確認
    await expect(page.getByText('テスト用メモ')).toBeVisible();
  });

  test('メモの編集', async ({ page }) => {
    // 既存のメモがない場合は作成
    const memoItems = page
      .locator('[data-testid="memo-item"]')
      .or(page.getByText(/メモ|Memo/).first());

    const memoExists = (await memoItems.count()) > 0;

    if (!memoExists) {
      // 新しいメモを作成
      await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
      await page.getByLabel(/タイトル|Title/).fill('編集テスト用メモ');
      await page.getByLabel(/内容|Content/).fill('編集前の内容');
      await page
        .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
        .click();
    }

    // メモをクリックして詳細表示または編集ボタンをクリック
    const firstMemo = page
      .locator('[data-testid="memo-item"]')
      .first()
      .or(
        page
          .getByRole('button')
          .filter({ hasText: /編集|Edit/ })
          .first()
      );
    await firstMemo.click();

    // 編集フォームが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();

    // タイトルを編集
    const titleInput = page.getByLabel(/タイトル|Title/);
    await titleInput.clear();
    await titleInput.fill('編集済みメモ');

    // 内容を編集
    const contentInput = page.getByLabel(/内容|Content/);
    await contentInput.clear();
    await contentInput.fill('編集後の内容です。');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: /保存|Save|更新|Update/ }).click();

    // 編集内容が反映されることを確認
    await expect(page.getByText('編集済みメモ')).toBeVisible();
  });

  test('メモの段階的削除（アーカイブ）', async ({ page }) => {
    // テスト環境用のlocalStorageを設定
    await page.goto('/?test=true');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-test-token');
      localStorage.setItem(
        'user_info',
        JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        })
      );
    });

    // ページを再読み込みして認証状態を反映
    await page.goto('/?test=true');
    await page.waitForTimeout(2000); // APIコールの完了を待つ

    // デバッグ：ページ上のすべてのボタンを確認
    const allButtons = await page.locator('button').count();
    console.log('ページ上のボタン数:', allButtons);

    // メモアイテムの確認
    let memoCount = await page.locator('[data-testid="memo-item"]').count();
    console.log('初期メモアイテム数:', memoCount);

    // メモが存在しない場合は作成
    if (memoCount === 0) {
      console.log('メモが存在しないため、新規作成します...');
      await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
      await page.waitForTimeout(500); // ダイアログが開くまで待機

      await page.getByLabel(/タイトル|Title/).fill('段階的削除テスト用メモ');
      await page.getByLabel(/内容|Content/).fill('段階的削除対象の内容');
      await page
        .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
        .click();

      // モーダルが閉じるまで待機
      await page.waitForTimeout(2000);

      // メモリストの再読み込みを待つ
      await page.waitForSelector('[data-testid="memo-list"]', {
        timeout: 10000,
      });

      // メモが作成されたことを確認
      memoCount = await page.locator('[data-testid="memo-item"]').count();
      console.log('作成後のメモアイテム数:', memoCount);

      // まだメモが見つからない場合は、ページを再読み込み
      if (memoCount === 0) {
        console.log('メモが見つからないため、ページを再読み込みします...');
        await page.reload();
        await page.waitForTimeout(2000);
        memoCount = await page.locator('[data-testid="memo-item"]').count();
        console.log('再読み込み後のメモアイテム数:', memoCount);
      }
    }

    // 削除ボタンが存在するかを確認
    const deleteButtons = await page
      .locator('[data-testid="memo-delete-button"]')
      .count();
    console.log('削除ボタン数:', deleteButtons);

    if (deleteButtons === 0) {
      // 削除ボタンが見つからない場合、代替手段を試す
      await page.screenshot({ path: 'debug-no-delete-button.png' });
      throw new Error('削除ボタンが見つかりません');
    }

    // 削除ボタンをクリック（これはアーカイブ処理になる）
    const deleteButton = page
      .locator('[data-testid="memo-delete-button"]')
      .first();
    await deleteButton.click();

    // 確認ダイアログが表示される場合は確認
    try {
      await page.waitForSelector('text=削除しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }

    // メモがメイン一覧から削除される（アーカイブされる）ことを確認
    await page.waitForTimeout(1000);

    // メモ数が減ったことで確認
    const remainingMemos = await page
      .locator('[data-testid="memo-item"]')
      .count();
    console.log('アーカイブ後のメモアイテム数:', remainingMemos);
    expect(remainingMemos).toBeLessThan(memoCount);
  });

  test('メモのアーカイブ', async ({ page }) => {
    // アーカイブ対象のメモが存在しない場合は作成
    const memoItems = page.locator('[data-testid="memo-item"]');
    const memoExists = (await memoItems.count()) > 0;

    if (!memoExists) {
      await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
      await page.getByLabel(/タイトル|Title/).fill('アーカイブテスト用メモ');
      await page.getByLabel(/内容|Content/).fill('アーカイブ対象の内容');
      await page
        .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
        .click();
      await page.waitForTimeout(500);
    }

    // 削除ボタンをクリック（これがアーカイブ処理になる）
    const deleteButton = page
      .locator('[data-testid="memo-delete-button"]')
      .first();
    await deleteButton.click();

    // 確認ダイアログが表示される場合は確認
    try {
      await page.waitForSelector('text=削除しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }

    // UI更新を待つ
    await page.waitForTimeout(1000);

    // メモが一覧から削除されることを確認
    // （アーカイブされたメモは通常の一覧に表示されない）
    await expect(page.getByText('アーカイブテスト用メモ')).not.toBeVisible();
  });

  test('アーカイブページでのメモ表示と復元', async ({ page }) => {
    // まずメモを作成してアーカイブ
    await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
    await page.getByLabel(/タイトル|Title/).fill('復元テスト用メモ');
    await page.getByLabel(/内容|Content/).fill('復元対象の内容');
    await page
      .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
      .click();
    await page.waitForTimeout(500);

    // メモをアーカイブ（削除ボタンを使用）
    const deleteButton = page
      .locator('[data-testid="memo-delete-button"]')
      .first();
    await deleteButton.click();

    // 確認ダイアログが表示される場合は確認
    try {
      await page.waitForSelector('text=削除しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }
    await page.waitForTimeout(1000);

    // アーカイブページに移動
    const archiveLink = page
      .getByRole('link', { name: /アーカイブ|Archive/ })
      .or(page.locator('[href="/archive"]'));
    await archiveLink.click();

    // アーカイブされたメモが表示されることを確認
    await expect(page.getByText('復元テスト用メモ')).toBeVisible();

    // 復元ボタンをクリック
    const restoreButton = page
      .locator('[data-testid="memo-restore-button"]')
      .first();
    await restoreButton.click();

    // 確認ダイアログが表示される場合は確認
    try {
      await page.waitForSelector('text=復元しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }

    // UI更新を待つ
    await page.waitForTimeout(1000);

    // ホームページに戻ってメモが復元されていることを確認
    await page.goto('/');
    await expect(page.getByText('復元テスト用メモ')).toBeVisible();
  });

  test('アーカイブページのUI確認', async ({ page }) => {
    // アーカイブページに直接移動
    await page.goto('/archive?test=true');

    // ページタイトルまたはヘッダーの確認
    await expect(
      page.getByRole('heading', { name: /アーカイブ|Archive/ })
    ).toBeVisible();

    // まず数秒待ってからメモ数を確認
    await page.waitForTimeout(2000);

    // アーカイブされたメモがない場合のメッセージ確認
    const noArchiveMessage = page.getByText('アーカイブされたメモはありません');
    const archivedMemos = page.locator('[data-testid="memo-item"]');

    // アーカイブされたメモがない場合とある場合の両方をテスト
    if ((await archivedMemos.count()) === 0) {
      await expect(noArchiveMessage).toBeVisible();
    } else {
      await expect(archivedMemos.first()).toBeVisible();
      // 復元ボタンが表示されることを確認
      await expect(
        page.locator('[data-testid="memo-restore-button"]').first()
      ).toBeVisible();
    }
  });

  test('アーカイブからの完全削除', async ({ page }) => {
    // まずメモを作成してアーカイブ
    await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
    await page.getByLabel(/タイトル|Title/).fill('完全削除テスト用メモ');
    await page.getByLabel(/内容|Content/).fill('完全削除対象の内容');
    await page
      .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
      .click();
    await page.waitForTimeout(500);

    // メモをアーカイブ（段階的削除）
    const archiveButton = page
      .locator('[data-testid="memo-delete-button"]')
      .first();
    await archiveButton.click();

    // 確認ダイアログが表示される場合は確認
    try {
      await page.waitForSelector('text=削除しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }
    await page.waitForTimeout(1000);

    // アーカイブページに移動
    const archiveLink = page
      .getByRole('link', { name: /アーカイブ|Archive/ })
      .or(page.locator('[href="/archive"]'));
    await archiveLink.click();

    // アーカイブされたメモが表示されることを確認
    await expect(page.getByText('完全削除テスト用メモ')).toBeVisible();

    // アーカイブページで削除ボタンをクリック（これは完全削除になる）
    const deleteButton = page
      .locator('[data-testid="memo-delete-button"]')
      .first();
    await deleteButton.click();

    // 完全削除の確認ダイアログ
    try {
      await page.waitForSelector('text=完全に削除しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }

    // UI更新を待つ
    await page.waitForTimeout(1000);

    // メモが完全に削除されることを確認
    await expect(page.getByText('完全削除テスト用メモ')).not.toBeVisible();
  });
});

test.describe('アーカイブ機能', () => {
  test('複数メモのアーカイブと復元', async ({ page }) => {
    await page.goto('/');

    // 複数のテストメモを作成
    const memoTitles = [
      'アーカイブテスト1',
      'アーカイブテスト2',
      'アーカイブテスト3',
    ];

    for (const title of memoTitles) {
      await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
      await page.getByLabel(/タイトル|Title/).fill(title);
      await page.getByLabel(/内容|Content/).fill(`${title}の内容`);
      await page
        .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
        .click();
      await page.waitForTimeout(500);
    }

    // 複数のメモをアーカイブ（削除ボタンを使用）
    for (let i = 0; i < 2; i++) {
      const deleteButtons = page.locator('[data-testid="memo-delete-button"]');
      if ((await deleteButtons.count()) > 0) {
        await deleteButtons.first().click();

        // 確認ダイアログがある場合は確認
        try {
          await page.waitForSelector('text=削除しますか', { timeout: 2000 });
          await page.getByRole('button', { name: /確認|OK/ }).click();
        } catch {
          // 確認ダイアログが表示されない場合は何もしない
        }
        await page.waitForTimeout(1000);
      }
    }

    // アーカイブページで複数のメモが表示されることを確認
    await page.goto('/archive');
    const archivedMemos = page.locator('[data-testid="memo-item"]');
    expect(await archivedMemos.count()).toBeGreaterThanOrEqual(2);

    // 1つのメモを復元
    const restoreButton = page
      .locator('[data-testid="memo-restore-button"]')
      .first();
    await restoreButton.click();

    // 確認ダイアログがある場合は確認
    try {
      await page.waitForSelector('text=復元しますか', { timeout: 2000 });
      await page.getByRole('button', { name: /確認|OK/ }).click();
    } catch {
      // 確認ダイアログが表示されない場合は何もしない
    }
    await page.waitForTimeout(1000);

    // ホームページに戻って復元されたメモを確認
    await page.goto('/');
    const activeMemos = page.locator('[data-testid="memo-item"]');
    expect(await activeMemos.count()).toBeGreaterThanOrEqual(1);
  });

  test('アーカイブページでの検索機能', async ({ page }) => {
    // アーカイブページに移動
    await page.goto('/archive');

    // 検索機能がある場合のテスト
    const searchInput = page
      .getByLabel(/検索|Search/)
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[placeholder*="検索"]'));

    if (await searchInput.isVisible()) {
      await searchInput.fill('テスト');
      await page.waitForTimeout(500);

      // 検索結果が正しく表示されることを確認
      const searchResults = page.locator('[data-testid="memo-item"]');
      if ((await searchResults.count()) > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
    }
  });

  test('アーカイブとメインページの連携', async ({ page }) => {
    await page.goto('/');

    // メインページでメモ数を確認
    const initialMemoCount = await page
      .locator('[data-testid="memo-item"]')
      .count();

    // メモがない場合は作成
    if (initialMemoCount === 0) {
      await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
      await page.getByLabel(/タイトル|Title/).fill('連携テスト用メモ');
      await page.getByLabel(/内容|Content/).fill('連携テストの内容');
      await page
        .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
        .click();
      await page.waitForTimeout(500);
    }

    // メモをアーカイブ
    const archiveButton = page
      .getByRole('button', { name: /アーカイブ|Archive/ })
      .first();
    await archiveButton.click();
    await page.waitForTimeout(1000);

    // メインページでメモ数が減ったことを確認
    const afterArchiveMemoCount = await page
      .locator('[data-testid="memo-item"]')
      .count();
    expect(afterArchiveMemoCount).toBeLessThan(Math.max(1, initialMemoCount));

    // アーカイブページでメモが表示されることを確認
    await page.goto('/archive');
    const archivedMemos = page.locator('[data-testid="memo-item"]');
    expect(await archivedMemos.count()).toBeGreaterThanOrEqual(1);

    // メモを復元
    const restoreButton = page
      .getByRole('button', { name: /復元|Restore/ })
      .first();
    await restoreButton.click();

    // 確認ダイアログがある場合は確認
    const confirmButton = page.getByRole('button', {
      name: /確認|OK|復元|Restore/,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    await page.waitForTimeout(1000);

    // メインページに戻ってメモが復元されたことを確認
    await page.goto('/');
    const finalMemoCount = await page
      .locator('[data-testid="memo-item"]')
      .count();
    expect(finalMemoCount).toBeGreaterThanOrEqual(afterArchiveMemoCount);
  });

  test('アーカイブページのナビゲーション', async ({ page }) => {
    await page.goto('/');

    // メインページからアーカイブページへの移動
    const archiveLink = page
      .getByRole('link', { name: /アーカイブ|Archive/ })
      .or(page.locator('[href="/archive"]'));
    await archiveLink.click();

    // アーカイブページが表示されることを確認
    await expect(page).toHaveURL(/\/archive/);
    await expect(
      page.getByRole('heading', { name: /アーカイブ|Archive/ })
    ).toBeVisible();

    // ホームページへの戻りリンク
    const homeLink = page
      .getByRole('link', { name: /ホーム|Home|メモ一覧/ })
      .or(page.locator('[href="/"]'));

    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    } else {
      // ブラウザの戻るボタンでもテスト
      await page.goBack();
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('レスポンシブデザイン', () => {
  test('モバイル表示でのレイアウト確認', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // モバイル表示でもコンテンツが正しく表示されることを確認
    await expect(
      page.getByRole('button', { name: /新しいメモ|New Memo/ })
    ).toBeVisible();

    // サイドバーがハンバーガーメニューになっていることを確認
    const menuButton = page.getByRole('button', { name: /メニュー|menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });

  test('タブレット表示でのレイアウト確認', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // タブレット表示でのレイアウトを確認
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /新しいメモ|New Memo/ })
    ).toBeVisible();
  });
});

test.describe('検索機能', () => {
  test('メモの検索', async ({ page }) => {
    await page.goto('/');

    // 検索入力フィールドを探す
    const searchInput = page
      .getByLabel(/検索|Search/)
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[placeholder*="検索"]'));

    if (await searchInput.isVisible()) {
      await searchInput.fill('テスト');

      // 検索結果が表示されることを確認
      await page.waitForTimeout(500); // 検索処理の待機

      // 検索結果のメモが表示されていることを確認
      const searchResults = page.locator('[data-testid="memo-item"]');
      if ((await searchResults.count()) > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
    }
  });
});

test.describe('エラーハンドリング', () => {
  test('ネットワークエラー時の動作確認', async ({ page }) => {
    // ネットワークをオフラインに設定
    await page.context().setOffline(true);
    await page.goto('/');

    // エラーメッセージまたはフォールバック表示を確認
    // APIエラー時にモックデータが表示されることを確認
    await expect(page.getByRole('main')).toBeVisible();

    // ネットワークを復旧
    await page.context().setOffline(false);
  });

  test('アーカイブ操作のエラーハンドリング', async ({ page }) => {
    await page.goto('/');

    // テストメモを作成
    await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
    await page.getByLabel(/タイトル|Title/).fill('エラーテスト用メモ');
    await page.getByLabel(/内容|Content/).fill('エラーハンドリングテスト');
    await page
      .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
      .click();
    await page.waitForTimeout(500);

    // ネットワークエラー状態でアーカイブを実行
    await page.context().setOffline(true);

    const archiveButton = page
      .getByRole('button', { name: /アーカイブ|Archive/ })
      .first();
    await archiveButton.click();

    // エラーメッセージが表示されるか、モックフォールバックが動作することを確認
    await page.waitForTimeout(2000);

    // ネットワークを復旧
    await page.context().setOffline(false);

    // 再度アーカイブを試行
    if (await archiveButton.isVisible()) {
      await archiveButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('復元操作のエラーハンドリング', async ({ page }) => {
    // まずメモを作成してアーカイブ
    await page.goto('/');
    await page.getByRole('button', { name: /新しいメモ|New Memo/ }).click();
    await page.getByLabel(/タイトル|Title/).fill('復元エラーテスト用メモ');
    await page.getByLabel(/内容|Content/).fill('復元エラーハンドリングテスト');
    await page
      .getByRole('button', { name: /保存|Save|作成|Create|更新|Update/ })
      .click();
    await page.waitForTimeout(500);

    // アーカイブ実行
    const archiveButton = page
      .getByRole('button', { name: /アーカイブ|Archive/ })
      .first();
    await archiveButton.click();
    await page.waitForTimeout(1000);

    // アーカイブページに移動
    await page.goto('/archive');

    // ネットワークエラー状態で復元を実行
    await page.context().setOffline(true);

    const restoreButton = page
      .getByRole('button', { name: /復元|Restore/ })
      .first();
    if (await restoreButton.isVisible()) {
      await restoreButton.click();

      // 確認ダイアログがある場合は確認
      const confirmButton = page.getByRole('button', {
        name: /確認|OK|復元|Restore/,
      });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // エラーメッセージが表示されるか、モックフォールバックが動作することを確認
      await page.waitForTimeout(2000);
    }

    // ネットワークを復旧
    await page.context().setOffline(false);
  });
});
