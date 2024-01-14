# check-attendance-docker

## 初期設定
### 各種インストール
下記のソフトウェアをインストールしてください。
- [VSCode](https://code.visualstudio.com/)
- [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)：VSCodeの拡張機能
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [DBeaver](https://dbeaver.io/download/)：データベースクライアント
### リポジトリのクローン
```
$ git clone　git@github.com:oXyut/check-attendance-docker.git
```
- これでエラーが出る場合は、SSHの設定ができていない可能性があります。  

### コンテナの起動
1. Docker Desktopを起動します。
1. VSCodeでcloneしてきたリポジトリを開きます。
1. VSCodeウィンドウ上の左下の緑色のボタンを押して、`Remote-Containers: Reopen in Container`（`コンテナを再度開く`）を選択します。
1. コンテナが起動するので、しばらく待ちます（初回は時間がかかります）。

### 初回時のデータベースのテーブル作成
1. コンテナに入ったあと、ターミナルで`$ sudo yarn run prisma generate`を実行
2. 同じくターミナルで`$ sudo yarn run prisma migrate dev --name init`を実行




