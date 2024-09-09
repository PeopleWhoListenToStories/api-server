
export const getRandomBackground = () => {
  const r = Math.floor(Math.random() * 256); // 0-255 之间的随机整数
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const alpha = Math.random(); // 0-1 之间的随机浮点数

  return { r, g, b, alpha };
}