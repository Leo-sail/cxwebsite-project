import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * 动画状态
 */
export type AnimationState = 'idle' | 'running' | 'paused' | 'finished';

/**
 * 动画配置
 */
export interface UseAnimationConfig {
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画延迟（毫秒） */
  delay?: number;
  /** 动画缓动函数 */
  easing?: string;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 动画方向 */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

/**
 * 动画钩子返回值
 */
export interface UseAnimationReturn {
  /** 动画状态 */
  state: AnimationState;
  /** 动画进度（0-1） */
  progress: number;
  /** 开始动画 */
  start: () => void;
  /** 暂停动画 */
  pause: () => void;
  /** 恢复动画 */
  resume: () => void;
  /** 停止动画 */
  stop: () => void;
  /** 重置动画 */
  reset: () => void;
  /** 设置进度 */
  setProgress: (progress: number) => void;
}

/**
 * 动画钩子
 * 提供基础的动画控制功能
 */
export const useAnimation = (config: UseAnimationConfig = {}): UseAnimationReturn => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease',
    autoPlay = false,
    loop = false,
    direction = 'normal'
  } = config;

  const [state, setState] = useState<AnimationState>('idle');
  const [progress, setProgressState] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // 缓动函数映射
  const easingFunctions = useMemo(() => ({
    linear: (t: number) => t,
    ease: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'ease-in-cubic': (t: number) => t * t * t,
    'ease-out-cubic': (t: number) => (--t) * t * t + 1,
    'ease-in-out-cubic': (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    'ease-in-quart': (t: number) => t * t * t * t,
    'ease-out-quart': (t: number) => 1 - (--t) * t * t * t,
    'ease-in-out-quart': (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    'ease-in-back': (t: number) => t * t * (2.7 * t - 1.7),
    'ease-out-back': (t: number) => 1 + (--t) * t * (2.7 * t + 1.7),
    'ease-in-out-back': (t: number) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  }), []);

  // 获取缓动函数
  const getEasingFunction = useCallback((easingName: string) => {
    return easingFunctions[easingName as keyof typeof easingFunctions] || easingFunctions.ease;
  }, [easingFunctions]);

  // 动画循环
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp - pausedTimeRef.current;
    }

    const elapsed = timestamp - startTimeRef.current - delay;
    
    if (elapsed < 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    let rawProgress = Math.min(elapsed / duration, 1);
    
    // 处理动画方向
    if (direction === 'reverse') {
      rawProgress = 1 - rawProgress;
    } else if (direction === 'alternate' || direction === 'alternate-reverse') {
      const cycle = Math.floor(elapsed / duration);
      const isReverse = direction === 'alternate-reverse' ? cycle % 2 === 0 : cycle % 2 === 1;
      if (isReverse) {
        rawProgress = 1 - (rawProgress % 1);
      } else {
        rawProgress = rawProgress % 1;
      }
    }

    // 应用缓动函数
    const easingFunction = getEasingFunction(easing);
    const easedProgress = easingFunction(rawProgress);
    
    setProgressState(easedProgress);

    if (elapsed >= duration) {
      if (loop) {
        startTimeRef.current = timestamp;
        pausedTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setState('finished');
        animationRef.current = null;
      }
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [duration, delay, easing, direction, loop, getEasingFunction]);

  // 开始动画
  const start = useCallback(() => {
    if (state === 'running') return;
    
    setState('running');
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  }, [state, animate]);

  // 暂停动画
  const pause = useCallback(() => {
    if (state !== 'running') return;
    
    setState('paused');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (startTimeRef.current) {
      pausedTimeRef.current = performance.now() - startTimeRef.current;
    }
  }, [state]);

  // 恢复动画
  const resume = useCallback(() => {
    if (state !== 'paused') return;
    
    setState('running');
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  }, [state, animate]);

  // 停止动画
  const stop = useCallback(() => {
    setState('idle');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setProgressState(0);
  }, []);

  // 重置动画
  const reset = useCallback(() => {
    stop();
    setProgressState(0);
  }, [stop]);

  // 设置进度
  const setProgress = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    setProgressState(clampedProgress);
    
    if (state === 'running') {
      // 如果正在运行，调整时间偏移
      const targetTime = clampedProgress * duration;
      pausedTimeRef.current = targetTime;
      startTimeRef.current = null;
    }
  }, [duration, state]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && state === 'idle') {
      start();
    }
  }, [autoPlay, state, start]);

  // 清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    state,
    progress,
    start,
    pause,
    resume,
    stop,
    reset,
    setProgress
  };
};

/**
 * 滚动动画钩子
 */
export interface UseScrollAnimationConfig {
  /** 触发阈值（0-1） */
  threshold?: number;
  /** 是否只触发一次 */
  once?: boolean;
  /** 根边距 */
  rootMargin?: string;
}

export interface UseScrollAnimationReturn {
  /** 元素引用 */
  ref: React.RefObject<HTMLElement | null>;
  /** 是否在视口中 */
  inView: boolean;
  /** 滚动进度 */
  progress: number;
}

/**
 * 滚动动画钩子
 * 基于Intersection Observer API实现滚动触发动画
 */
export const useScrollAnimation = (config: UseScrollAnimationConfig = {}): UseScrollAnimationReturn => {
  const {
    threshold = 0.1,
    once = true,
    rootMargin = '0px'
  } = config;

  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);
        
        // 计算滚动进度
        if (isIntersecting) {
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight;
          const elementTop = rect.top;
          const elementHeight = rect.height;
          
          // 计算元素在视口中的进度
          const visibleHeight = Math.min(windowHeight - elementTop, elementHeight);
          const progressValue = Math.max(0, Math.min(1, visibleHeight / elementHeight));
          setProgress(progressValue);
        } else if (!once) {
          setProgress(0);
        }
        
        if (once && isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return {
    ref,
    inView,
    progress
  };
};

export default useAnimation;