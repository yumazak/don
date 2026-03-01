# don

YAML 設定駆動の dotfiles マネージャー。シンボリックリンクで設定ファイルを一元管理する。

## インストール

```bash
bun install
bun run build
```

`dist/don` にシングルバイナリが生成される。パスの通った場所にコピーして使う。

```bash
cp dist/don ~/.local/bin/don
```

## 使い方

`dotfiles.yml` があるディレクトリで実行する。

```bash
# 全グループのシンボリックリンクを作成
don link

# 特定グループのみ
don link -s claude

# 全シンボリックリンクを削除
don unlink

# 特定グループのみ
don unlink -s mise

# critical ファイルも強制削除
don unlink --force
```

## 設定ファイル

プロジェクトルートに `dotfiles.yml` を配置する。

```yaml
mappings:
  mise:
    - source: dotfiles/mise/config/config.toml
      destination: ~/.config/mise/config.toml
      critical: true
  claude:
    - source: dotfiles/agents/agents
      destination: ~/.claude/agents
      type: directory
    - source: dotfiles/.claude/settings.json
      destination: ~/.claude/settings.json
```

### フィールド

| フィールド | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `source` | yes | - | ソースファイル/ディレクトリのパス（プロジェクトルートからの相対パス） |
| `destination` | yes | - | シンボリックリンクの作成先（`~` はホームディレクトリに展開） |
| `critical` | no | `false` | `true` の場合、`--force` なしでは unlink をスキップ |
| `type` | no | `"file"` | `"file"` または `"directory"` |

## 開発

```bash
# 開発実行
bun run dev -- link -s mise

# リント
bun run lint

# テスト
bun test

# ビルド
bun run build
```

## 技術スタック

- [bun](https://bun.sh) — ランタイム / バンドラー
- [incur](https://github.com/wevm/incur) — CLI フレームワーク
- [oxlint](https://oxc.rs) — リンター
- [yaml](https://eemeli.org/yaml/) — YAML パーサー
