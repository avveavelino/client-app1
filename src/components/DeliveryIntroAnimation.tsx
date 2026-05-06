import { useEffect, useState } from "react";

interface DeliveryIntroAnimationProps {
  onDone?: () => void;
  duration?: number;
}

const chickens = [
  { emoji: "🐔", top: "18%", delay: "0s", duration: "5s", size: "text-3xl", anim: "chicken-drift-1" },
  { emoji: "🐔", top: "32%", delay: "0.6s", duration: "6s", size: "text-2xl", anim: "chicken-drift-2" },
  { emoji: "🐔", top: "55%", delay: "1.2s", duration: "5.5s", size: "text-4xl", anim: "chicken-drift-3" },
  { emoji: "🐥", top: "25%", delay: "0.3s", duration: "7s", size: "text-2xl", anim: "chicken-drift-2" },
  { emoji: "🐔", top: "65%", delay: "0.9s", duration: "6.5s", size: "text-3xl", anim: "chicken-drift-1" },
];

const eggs = [
  { left: "-10%", delay: "0.2s", duration: "3.2s", size: "text-2xl" },
  { left: "-25%", delay: "0.8s", duration: "3.6s", size: "text-xl" },
  { left: "-40%", delay: "1.4s", duration: "3.4s", size: "text-3xl" },
  { left: "-55%", delay: "2s", duration: "3.8s", size: "text-2xl" },
];

export function DeliveryIntroAnimation({ onDone, duration = 3600 }: DeliveryIntroAnimationProps) {
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 600);
    const doneTimer = setTimeout(() => {
      setHidden(true);
      onDone?.();
    }, duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes truck-arc {
          0%   { transform: translate(-30vw, 20px) rotate(-2deg); }
          25%  { transform: translate(15vw, -10px) rotate(1deg); }
          50%  { transform: translate(40vw, 10px) rotate(-1deg); }
          75%  { transform: translate(75vw, -8px) rotate(1.5deg); }
          100% { transform: translate(130vw, 15px) rotate(-1deg); }
        }
        @keyframes truck-bounce {
          0%, 100% { transform: translateY(0); }
          20%, 60% { transform: translateY(-3px); }
          40%, 80% { transform: translateY(2px); }
        }
        @keyframes wheel-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes dust-puff {
          0%   { opacity: 0.6; transform: translate(0,0) scale(0.6); }
          100% { opacity: 0; transform: translate(-30px, -10px) scale(1.4); }
        }
        @keyframes chicken-drift-1 {
          0%   { transform: translate(-15vw, 0) rotate(-4deg); }
          50%  { transform: translate(50vw, -18px) rotate(3deg); }
          100% { transform: translate(115vw, 0) rotate(-2deg); }
        }
        @keyframes chicken-drift-2 {
          0%   { transform: translate(115vw, 0) rotate(4deg); }
          50%  { transform: translate(50vw, 12px) rotate(-3deg); }
          100% { transform: translate(-15vw, 0) rotate(2deg); }
        }
        @keyframes chicken-drift-3 {
          0%   { transform: translate(-15vw, 10px) rotate(0deg); }
          25%  { transform: translate(30vw, -20px) rotate(5deg); }
          75%  { transform: translate(80vw, 5px) rotate(-5deg); }
          100% { transform: translate(115vw, -10px) rotate(0deg); }
        }
        @keyframes egg-roll {
          0%   { transform: translateX(0) rotate(0deg); }
          90%  { transform: translateX(140vw) rotate(1440deg); }
          95%  { transform: translateX(138vw) translateY(-8px) rotate(1480deg); }
          100% { transform: translateX(140vw) rotate(1500deg); }
        }
        @keyframes route-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes route-spin-rev {
          to { transform: rotate(-360deg); }
        }
        @keyframes overlay-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlay-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes title-rise {
          0%   { opacity: 0; transform: translateY(14px); }
          20%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.98 0.02 90) 0%, oklch(0.94 0.03 80) 60%, oklch(0.88 0.04 75) 100%)",
          animation: exiting
            ? "overlay-fade-out 600ms ease-out forwards"
            : "overlay-fade-in 300ms ease-out both",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
          <div
            className="w-[140vmin] h-[140vmin] rounded-full border-[2px] border-dashed border-foreground"
            style={{ animation: "route-spin 18s linear infinite" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <div
            className="w-[90vmin] h-[90vmin] rounded-full border-[2px] border-dotted border-foreground"
            style={{ animation: "route-spin-rev 14s linear infinite" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
          <div
            className="w-[50vmin] h-[50vmin] rounded-full border border-dashed border-foreground"
            style={{ animation: "route-spin 10s linear infinite" }}
          />
        </div>

        {chickens.map((c, i) => (
          <div
            key={i}
            className={`absolute ${c.size} select-none`}
            style={{
              top: c.top,
              left: 0,
              animation: `${c.anim} ${c.duration} ease-in-out ${c.delay} forwards`,
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.12))",
            }}
          >
            {c.emoji}
          </div>
        ))}

        <div
          className="absolute left-0 right-0"
          style={{
            bottom: "22%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, oklch(0.5 0.05 75 / 0.3) 20%, oklch(0.5 0.05 75 / 0.3) 80%, transparent)",
          }}
        />

        <div
          className="absolute"
          style={{
            top: "50%",
            left: 0,
            animation: "truck-arc 3.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards",
            willChange: "transform",
          }}
        >
          <div style={{ animation: "truck-bounce 0.4s ease-in-out infinite" }}>
            <div
              className="relative text-7xl md:text-8xl select-none"
              style={{
                transform: "scaleX(-1)",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.18))"
              }}
            >
              🚚
              <span
                className="absolute text-2xl opacity-0"
                style={{
                  bottom: "0px",
                  left: "-10px",
                  animation: "dust-puff 0.9s ease-out infinite",
                }}
              >
                💨
              </span>
              <span
                className="absolute text-xl opacity-0"
                style={{
                  bottom: "4px",
                  left: "-22px",
                  animation: "dust-puff 1.1s ease-out 0.3s infinite",
                }}
              >
                💨
              </span>
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0" style={{ bottom: "12%" }}>
          {eggs.map((e, i) => (
            <span
              key={i}
              className={`absolute ${e.size} select-none`}
              style={{
                left: e.left,
                bottom: 0,
                animation: `egg-roll ${e.duration} cubic-bezier(0.4, 0.0, 0.6, 1) ${e.delay} forwards`,
                filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.15))",
                display: "inline-block",
              }}
            >
              🥚
            </span>
          ))}
        </div>

        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: "22%", animation: "title-rise 3.4s ease-out forwards" }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground/90">
            Förbereder leveranser 📦
          </h2>

          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Snart redo att köra 🚚
          </p>
        </div>
      </div>
    </>
  );
}

export default DeliveryIntroAnimation;