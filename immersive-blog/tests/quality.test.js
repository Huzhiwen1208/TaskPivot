import { describe, expect, it } from 'vitest';
import {
  clampZoom,
  createFpsMonitor,
  detectQualityTier,
  parallaxOffset,
  settingsForTier,
} from '../src/three/quality.js';

describe('设备档位探测', () => {
  it('移动端与低配设备降级为 low', () => {
    expect(detectQualityTier({ mobile: true })).toBe('low');
    expect(detectQualityTier({ width: 480 })).toBe('low');
    expect(detectQualityTier({ hardwareConcurrency: 4 })).toBe('low');
    expect(detectQualityTier({ deviceMemory: 4 })).toBe('low');
  });

  it('中等屏幕或六核设备为 medium', () => {
    expect(detectQualityTier({ width: 1100 })).toBe('medium');
    expect(detectQualityTier({ hardwareConcurrency: 6 })).toBe('medium');
  });

  it('桌面高分设备为 high', () => {
    expect(detectQualityTier({ width: 1600, hardwareConcurrency: 10, deviceMemory: 16 })).toBe(
      'high',
    );
  });

  it('每个档位都返回安全的渲染参数', () => {
    ['high', 'medium', 'low'].forEach((tier) => {
      const settings = settingsForTier(tier);
      expect(settings.particles).toBeGreaterThan(0);
      expect(settings.maxDpr).toBeGreaterThanOrEqual(1);
      expect(settings.satellites).toBeGreaterThanOrEqual(4);
    });
  });

  it('未知档位回退到 medium，且返回值是副本', () => {
    const settings = settingsForTier('ultra');
    expect(settings.particles).toBe(settingsForTier('medium').particles);
    settings.particles = 0;
    expect(settingsForTier('medium').particles).toBeGreaterThan(0);
  });
});

describe('帧率监测', () => {
  it('持续低帧率两次采样后建议降级', () => {
    const monitor = createFpsMonitor({ threshold: 45, sampleSize: 10, strikes: 2 });
    let degraded = false;

    for (let i = 0; i < 20; i += 1) {
      degraded = monitor.push(1000 / 30); // 30fps
    }
    expect(degraded).toBe(true);
  });

  it('高帧率不会触发降级', () => {
    const monitor = createFpsMonitor({ threshold: 45, sampleSize: 10, strikes: 2 });
    let degraded = false;
    for (let i = 0; i < 60; i += 1) {
      degraded = monitor.push(1000 / 60);
    }
    expect(degraded).toBe(false);
  });

  it('偶发掉帧不会立刻降级', () => {
    const monitor = createFpsMonitor({ threshold: 45, sampleSize: 5, strikes: 2 });
    for (let i = 0; i < 5; i += 1) monitor.push(1000 / 20);
    let degraded = false;
    for (let i = 0; i < 10; i += 1) degraded = monitor.push(1000 / 60);
    expect(degraded).toBe(false);
  });

  it('忽略非法帧间隔', () => {
    const monitor = createFpsMonitor();
    expect(monitor.push(0)).toBe(false);
    expect(monitor.push(Number.NaN)).toBe(false);
  });
});

describe('相机与视差工具', () => {
  it('缩放被限制在区间内', () => {
    expect(clampZoom(1)).toBe(5.2);
    expect(clampZoom(99)).toBe(11.5);
    expect(clampZoom(8)).toBe(8);
    expect(clampZoom(99, 6, 12)).toBe(12);
  });

  it('滚动进度映射为视差偏移并做上下界保护', () => {
    const start = parallaxOffset(0);
    expect(start.x).toBe(0);
    expect(Math.abs(start.y)).toBe(0);
    expect(parallaxOffset(0.5, 2)).toEqual({ x: 1, y: -0.55 });
    expect(parallaxOffset(2, 1).x).toBe(1);
    expect(parallaxOffset(-1, 1).x).toBe(0);
  });
});
