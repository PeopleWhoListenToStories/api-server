FROM node:20.15.0

# 设置工作目录
WORKDIR /app

# 设置淘宝镜像
RUN npm config set registry http://registry.npm.taobao.org/

# 安装 pnpm 以便启动应用
RUN npm install -g pnpm@8.15.8

# 复制只需要的构建产物和依赖
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

# 安装生产依赖（只安装生产环境依赖，减少体积）
RUN pnpm install

# 启动应用
CMD ["pnpm", "start:prod"]
