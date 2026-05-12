# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このリポジトリについて

Claude Code の学習・テスト用サンプルプロジェクト。複数の言語・技術スタックのサンプルコードが含まれる。

## コマンド

### task-app（React + Vite + TypeScript）

```bash
cd task-app
npm install
npm run dev      # 開発サーバー起動
npm run build    # ビルド（tsc + vite build）
npm run preview  # ビルド結果のプレビュー
```

### web（Express サーバー）

```bash
cd web
node app.js      # サーバー起動（ポート 3000）
```

### Python

```bash
cd python
python -m pytest tests/          # テスト全件実行
python -m pytest tests/test_calculator.py  # 単一テスト実行
```

### ルート

```bash
npm install      # pptxgenjs などのルート依存インストール
node create_oshi_pptx.js  # PPTXファイル生成スクリプト
```

## アーキテクチャ

### task-app（メインアプリ）

React 18 + TypeScript + Tailwind CSS の PWA タスク管理アプリ。状態管理は Context API + `useReducer` で行う。

- `src/store/TaskContext.tsx` — グローバルストア。`Task[]` と `Project[]` を管理し、変更のたびに localStorage へ自動保存する。
- `src/store/actions.ts` — Reducer が受け付けるアクション型定義。
- `src/types.ts` — `Task` / `Project` の型定義。
- `src/components/` — UI コンポーネント群（`DayPanel`, `MonthCalendar`, `TaskForm`, `TaskItem`, `SearchView`, `ProjectSettings`）。
- `src/hooks/` — カスタムフック。
- `src/utils/` — `storage`（localStorage の読み書き）、`dateUtils`（繰り返しタスクの日付生成）。

タスクには繰り返し設定があり、`ADD_TASK` アクション時に `generateRepeatDates` で追加日付を展開してまとめて保存する。プロジェクト削除時は所属タスクをフォールバックプロジェクトへ自動移動する。

### web（シンプルな Express サーバー）

Express で `GET /` と `GET /health` のみを提供するミニマルサーバー（ポート 3000）。`utils.js` にユーティリティ関数あり。静的 HTML ファイル（clock, timer, snake_game, stick_runner）も同ディレクトリに存在する。

### infra（インフラ設定）

- `Dockerfile` — `web/` を Node 20 Alpine でコンテナ化（ポート 3000）。
- `schema.sql` — PostgreSQL スキーマ（`users` / `posts` テーブル）。

### python（各種サンプル）

電卓、ソートアルゴリズム、フィボナッチ、連結リスト、行列演算、TODOリスト、APIクライアントなどのサンプルスクリプト群。`tests/test_calculator.py` が pytest テストを提供する。

### languages（他言語サンプル）

`Main.java`、`main.rs`、`script.sh` の単体サンプルファイル。
