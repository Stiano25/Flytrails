import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Postcard from './Postcard.jsx';

const VISIBLE = 4;
const SPRING = { type: 'spring', stiffness: 280, damping: 30, mass: 0.9 };

/** A stable, gentle tilt and offset per card, so the pile looks hand-held rather than machine-stacked. */
function pose(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  const r = ((h % 1000) + 1000) % 1000;
  return { rotate: (r / 1000) * 7 - 3.5, x: ((r * 7) % 17) - 8, y: ((r * 13) % 9) };
}

/**
 * Stories as a pile of postcards held like printed photos. Swipe the top card (or press Next) and it slides
 * aside, tucks in at the back of the pile, and the next card rises to the top. Previous brings the back card
 * out and lays it on top. Only transform and opacity animate; with reduced motion it simply crossfades.
 * The parent drives it through the imperative handle: `next()` / `prev()`.
 */
const PhotoStack = forwardRef(function PhotoStack({ stories, onOpen, preferredType, onChange }, ref) {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState(() => stories.map((s) => s.id));
  const [flying, setFlying] = useState(null); // { id, dir: 1 next / -1 previous, side: -1 left / 1 right }
  const byId = useMemo(() => Object.fromEntries(stories.map((s) => [s.id, s])), [stories]);

  // New list (filter changed): start again from the first story.
  useEffect(() => {
    setOrder(stories.map((s) => s.id));
    setFlying(null);
  }, [stories]);

  useEffect(() => {
    if (order.length) onChange?.(stories.findIndex((s) => s.id === order[0]));
  }, [order, stories, onChange]);

  const move = useCallback(
    (dir, side = -dir) => {
      if (flying || order.length < 2) return;
      if (reduce) {
        setOrder((o) => (dir > 0 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]));
        return;
      }
      // Next: the top card flies aside, then drops to the back. Previous: the back card flies out, then lands on top.
      setFlying({ id: dir > 0 ? order[0] : order[order.length - 1], dir, side });
    },
    [flying, order, reduce]
  );

  useImperativeHandle(ref, () => ({ next: () => move(1), prev: () => move(-1) }), [move]);

  function landed(id) {
    if (!flying || flying.id !== id) return;
    setOrder((o) => (flying.dir > 0 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]));
    setFlying(null);
  }

  const shown = order.slice(0, VISIBLE);
  if (flying && !shown.includes(flying.id)) shown.push(flying.id);

  return (
    <div className="relative h-full w-full">
      {shown.map((id) => {
        const story = byId[id];
        if (!story) return null;
        const depth = order.indexOf(id);
        const isTop = depth === 0 && !flying;
        const isFlying = flying?.id === id;
        const p = pose(id);
        const target = isFlying
          ? { x: `${flying.side * 62}%`, y: -18, rotate: flying.side * 9 + p.rotate, scale: 1, opacity: 1 }
          : reduce
            ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: depth === 0 ? 1 : 0 }
            : {
                x: depth === 0 ? 0 : p.x,
                y: depth * 7 + (depth === 0 ? 0 : p.y),
                rotate: depth === 0 ? p.rotate * 0.25 : p.rotate,
                scale: 1 - depth * 0.035,
                opacity: depth < VISIBLE - 1 ? 1 : 0,
              };
        return (
          <motion.div
            key={id}
            className="absolute inset-0 will-change-transform"
            style={{ zIndex: isFlying ? 60 : 40 - depth, transformOrigin: '50% 80%' }}
            // Cards that join the visible pile (or come out from the back for Previous) rise from behind it.
            initial={reduce ? false : { x: 0, y: VISIBLE * 7, rotate: p.rotate, scale: 1 - VISIBLE * 0.035, opacity: 0 }}
            animate={target}
            transition={reduce ? { duration: 0.18 } : isFlying ? { type: 'spring', stiffness: 320, damping: 32 } : SPRING}
            onAnimationComplete={() => isFlying && landed(id)}
            drag={isTop && !reduce ? 'x' : false}
            dragSnapToOrigin
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              // Either way you flick it, the top card goes to the back and the next story comes up.
              if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500) move(1, info.offset.x < 0 ? -1 : 1);
            }}
            whileDrag={{ scale: 1.02 }}
            aria-hidden={depth !== 0 || undefined}
            {...(depth !== 0 ? { inert: '' } : {})}
          >
            <div className={`h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
              <Postcard story={story} fill onOpen={onOpen} preferredType={preferredType} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default PhotoStack;
