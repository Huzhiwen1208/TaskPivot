/**
 * 设备能力探测与帧率监测。
 * 与渲染器解耦，便于单元测试与在低端设备上复用。
 */

/** 根据屏幕宽度、CPU 核心数与内存估算渲染档位 */
export function detectQualityTier({
  width = 1440,
  hardwareConcurrency = 8,
  deviceMemory = 8,
  mobile = false,
} = {}) {
  if (mobile || width < 760 || hardwareConcurrency <= 4 || deviceMemory <= 4) {
    return 'low';
  }
  if (width < 1280 || hardwareConcurrency <= 6 || deviceMemory <= 6) {
    return 'medium';
  }
  return 'high';
}

const PRESETS = {
  high: {
    particles: 2200,
    dust: 700,
    maxDpr: 2,
    antialias: true,
    satellites: 6,
    ringSegments: 180,
  },
  medium: {
    particles: 1200,
    dust: 380,
    maxDpr: 1.5,
    antialias: true,
    satellites: 5,
    ringSegments: 120,
  },
  low: {
    particles: 520,
    dust: 160,
    maxDpr: 1,
    antialias: false,
    satellites: 4,
    ringSegments: 80,
  },
};

/** 获取档位对应的渲染参数（返回副本，避免调用方误改常量） */
export function settingsForTier(tier) {
  return { ...(PRESETS[tier] || PRESETS.medium) };
}

/**
 * 帧率监测器：连续低于阈值若干次后建议降级一次。
 * push 接收两帧之间的毫秒间隔，返回 true 表示应执行降级。
 */
export function createFpsMonitor({ threshold = 45, sampleSize = 30, strikes = 2 } = {}) {
  let elapsed = 0;
  let frames = 0;
  let lowStreak = 0;

  return {
    push(deltaMs) {
      if (!Number.isFinite(deltaMs) || deltaMs <= 0) return false;
      elapsed += deltaMs;
      frames += 1;
      if (frames < sampleSize) return false;

      const fps = 1000 / (elapsed / frames);
      elapsed = 0;
      frames = 0;

      if (fps < threshold) {
        lowStreak += 1;
        if (lowStreak >= strikes) {
          lowStreak = 0;
          return true;
        }
      } else {
        lowStreak = 0;
      }
      return false;
    },
  };
}

/** 把相机距离限制在合理区间，避免穿模或缩放过远 */
export function clampZoom(value, min = 5.2, max = 11.5) {
  return Math.min(max, Math.max(min, value));
}

/** 将滚动进度（0~1）映射为视差偏移量 */
export function parallaxOffset(progress, strength = 1.6) {
  const p = Math.min(1, Math.max(0, progress));
  return { x: p * strength, y: -p * strength * 0.55 };
}
