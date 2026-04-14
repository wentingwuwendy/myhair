// MyHair - Hairstyle Presets
const HAIR_PRESETS = [
  {
    id: 'long-straight',
    name: '长直发',
    nameEn: 'Long Straight',
    emoji: '💇',
    params: { length: 85, curl: 5, volume: 40, bangs: 0, color: '#1a0a00' },
    description: '经典长直发，清爽利落'
  },
  {
    id: 'bob',
    name: 'Bob短发',
    nameEn: 'Bob Cut',
    emoji: '✂️',
    params: { length: 25, curl: 10, volume: 50, bangs: 30, color: '#2d1a00' },
    description: '时尚Bob头，精致干练'
  },
  {
    id: 'wavy-long',
    name: '长卷发',
    nameEn: 'Long Wavy',
    emoji: '🌊',
    params: { length: 80, curl: 65, volume: 60, bangs: 0, color: '#3d2000' },
    description: '浪漫长卷发，柔美飘逸'
  },
  {
    id: 'bun',
    name: '丸子头',
    nameEn: 'Bun',
    emoji: '🍡',
    params: { length: 10, curl: 0, volume: 80, bangs: 40, color: '#1a0a00' },
    description: '可爱丸子头，清爽活力'
  },
  {
    id: 'ponytail',
    name: '马尾',
    nameEn: 'Ponytail',
    emoji: '🐴',
    params: { length: 60, curl: 15, volume: 35, bangs: 20, color: '#2d1a00' },
    description: '简洁马尾，运动感十足'
  },
  {
    id: 'layered',
    name: '层次长发',
    nameEn: 'Layered Long',
    emoji: '🎋',
    params: { length: 75, curl: 30, volume: 65, bangs: 25, color: '#1a0a00' },
    description: '有层次感的长发，时尚立体'
  },
  {
    id: 'pixie',
    name: '超短发',
    nameEn: 'Pixie Cut',
    emoji: '⚡',
    params: { length: 8, curl: 5, volume: 55, bangs: 60, color: '#0d0800' },
    description: '个性超短发，大胆前卫'
  },
  {
    id: 'curly-short',
    name: '短卷发',
    nameEn: 'Short Curly',
    emoji: '🌀',
    params: { length: 20, curl: 80, volume: 75, bangs: 0, color: '#3d2000' },
    description: '蓬松短卷发，甜美可爱'
  }
];

const HAIR_COLORS = [
  { name: '自然黑', value: '#0d0800', gradient: ['#1a1000', '#0d0800'] },
  { name: '深棕', value: '#2d1a00', gradient: ['#4a2e00', '#1a0d00'] },
  { name: '暖棕', value: '#5c3300', gradient: ['#8a5000', '#3d2000'] },
  { name: '焦糖棕', value: '#8B5E3C', gradient: ['#c4884f', '#6b3f1f'] },
  { name: '金棕', value: '#B8860B', gradient: ['#ffd700', '#8B6914'] },
  { name: '亚麻金', value: '#D4A843', gradient: ['#f0c060', '#b08020'] },
  { name: '酒红', value: '#6B1A2E', gradient: ['#a02040', '#4a0f1e'] },
  { name: '紫调', value: '#4B2E5A', gradient: ['#7a4a90', '#2d1a3d'] },
  { name: '蓝黑', value: '#0a0a2a', gradient: ['#1a1a4a', '#05051a'] },
  { name: '灰白', value: '#c0b8b0', gradient: ['#e8e0d8', '#a09890'] }
];
