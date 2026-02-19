import { useEffect, useRef, useCallback } from "react";
import styles from "./voice-print.module.scss";

interface VoicePrintProps {
  frequencies?: Uint8Array;
  isActive?: boolean;
}

export function VoicePrint({ frequencies, isActive }: VoicePrintProps) {
  // Canvas reference, used to access the drawing context
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store historical frequency data for smoothing
  const historyRef = useRef<number[][]>([]);
  // Control the number of retained history frames to affect smoothness
  const historyLengthRef = useRef(10);
  // Store animation frame ID for cleanup
  const animationFrameRef = useRef<number>();

  /**
   * Update frequency history data
   * Maintain fixed-length history with a FIFO queue
   */
  const updateHistory = useCallback((freqArray: number[]) => {
    historyRef.current.push(freqArray);
    if (historyRef.current.length > historyLengthRef.current) {
      historyRef.current.shift();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /**
     * Handle high-DPI screen rendering
     * Adjust canvas render resolution based on device pixel ratio
     */
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    /**
     * Main drawing function
     * Use requestAnimationFrame for smooth animation
     * Includes the following steps:
     * 1. Clear the canvas
     * 2. Update history data
     * 3. Compute waveform points
     * 4. Draw the vertically symmetric voiceprint
     */
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!frequencies || !isActive) {
        historyRef.current = [];
        return;
      }

      const freqArray = Array.from(frequencies);
      updateHistory(freqArray);

      // Draw voiceprint
      const points: [number, number][] = [];
      const centerY = canvas.height / 2;
      const width = canvas.width;
      const sliceWidth = width / (frequencies.length - 1);

      // Draw main waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      /**
       * Voiceprint drawing algorithm:
       * 1. Use historical averages for smooth transitions
       * 2. Add natural oscillation using a sine function
       * 3. Connect points with Bezier curves for smoother lines
       * 4. Draw symmetric parts to form the full voiceprint
       */
      for (let i = 0; i < frequencies.length; i++) {
        const x = i * sliceWidth;
        let avgFrequency = frequencies[i];

        /**
         * Waveform smoothing:
         * 1. Collect frequency values at the same position from history
         * 2. Compute a weighted average of current and historical values
         * 3. Compute displayed height from the averaged value
         */
        if (historyRef.current.length > 0) {
          const historicalValues = historyRef.current.map((h) => h[i] || 0);
          avgFrequency =
            (avgFrequency + historicalValues.reduce((a, b) => a + b, 0)) /
            (historyRef.current.length + 1);
        }

        /**
         * Waveform transform:
         * 1. Normalize frequency values to the 0-1 range
         * 2. Add time-dependent sine transformation
         * 3. Smoothly connect points with Bezier curves
         */
        const normalized = avgFrequency / 255.0;
        const height = normalized * (canvas.height / 2);
        const y = centerY + height * Math.sin(i * 0.2 + Date.now() * 0.002);

        points.push([x, y]);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use Bezier curves to smooth the waveform
          const prevPoint = points[i - 1];
          const midX = (prevPoint[0] + x) / 2;
          ctx.quadraticCurveTo(
            prevPoint[0],
            prevPoint[1],
            midX,
            (prevPoint[1] + y) / 2,
          );
        }
      }

      // Draw the symmetric lower half
      for (let i = points.length - 1; i >= 0; i--) {
        const [x, y] = points[i];
        const symmetricY = centerY - (y - centerY);
        if (i === points.length - 1) {
          ctx.lineTo(x, symmetricY);
        } else {
          const nextPoint = points[i + 1];
          const midX = (nextPoint[0] + x) / 2;
          ctx.quadraticCurveTo(
            nextPoint[0],
            centerY - (nextPoint[1] - centerY),
            midX,
            centerY - ((nextPoint[1] + y) / 2 - centerY),
          );
        }
      }

      ctx.closePath();

      /**
       * Gradient effect:
       * Apply a three-color gradient with transparency from left to right
       * Use a blue palette to improve visual effect
       */
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(100, 180, 255, 0.95)");
      gradient.addColorStop(0.5, "rgba(140, 200, 255, 0.9)");
      gradient.addColorStop(1, "rgba(180, 220, 255, 0.95)");

      ctx.fillStyle = gradient;
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation loop
    draw();

    // Cleanup: cancel animation when component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [frequencies, isActive, updateHistory]);

  return (
    <div className={styles["voice-print"]}>
      <canvas ref={canvasRef} />
    </div>
  );
}
