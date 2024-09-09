# API SERVER

```shell
pnpm install

pnpm run start:dev

```

## 生成短链模块

```shell
# 生成
http://127.0.0.1:5010/short-url?url=https://baidu.com

# 访问
http://127.0.0.1:5010/8CWnBF

```

## 图片裁剪模块

```shell

# 裁剪传入的file大小
http://127.0.0.1:5010/image/crop?width=100&height=100

# 生成随机背景图片/裁剪传入的url大小
http://127.0.0.1:5010/image/crop-url?width=100&height=100

```

## 生成头像模块

```shell

# 生成随机fun-emoji头像
http://127.0.0.1:5010/image/fun-emoji/svg?clip=true&rotate=0&flip=false&seed=Felix&scale=50&radius=0&size=32&translateY=0&backgroundColor=b6e3f4&backgroundType=solid&backgroundRotation=0&eyes=closed&mouth=cute

```
