# Java
``eclipse-java-magcruise-style.xml`` を使う．

# JavaScript
``eclipse-javascript-magcruise-style.xml`` を使う．

# JSON
行の幅：100
インデント：スペースx2
![](https://i.gyazo.com/17d7c52f79db172a59ab0a3e38c82efb.png)

# HTML
行の幅：100
インデント：スペースx2
![](https://i.gyazo.com/4a4cb0f9fdb21d378dd571a348e006ae.png)

# CSS
~~行の幅：100~~
~~インデント：スペースx2~~
~~![](https://i.gyazo.com/5142546261feecfadeeec5306041f36c.png)~~
SCSS任せにする．

# SCSS
インデント：スペースx2

scssディレクトリ監視
```
cd magcruise-citywalk/src/main/webapp
scss --watch scss:css --sourcemap=none
```

scssディレクトリのscssファイルを一括で変換してcssディレクトリへ
```
cd magcruise-citywalk/src/main/webapp
sass --update scss:css --sourcemap=none
```

![](https://i.gyazo.com/3f381f28ba568861fd4034f6dbd3897b.png)


# 句読点
- 表示される日本語の文章では「，．」を使うこと．
- 一文だけ表示するときは末尾に句点はつけなくとも良い．
