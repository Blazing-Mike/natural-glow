import { gsap } from "gsap";

const tl = gsap.timeline({ defaults: { ease: "power1.out" } });

gsap.registerPlugin(Observer);
gsap.registerPlugin(ScrollTrigger);

gsap.set(".hero__text", { y: 550, transform: "rotate(-20deg)" });
gsap.set(".nav", { opacity: 0 });

tl.to(".black-bg", {
  duration: 1,
  width: "0%",
  //delay: 2,
})
  .to(".grey-bg", {
    duration: 1,
    width: "0%",
  })
  .from(".prl-logo", {
    duration: 3,
    y: 450,
    ease: "power4.out",
  })
  .from(".prl-img", {
    duration: 2,
    scale: 0.5,
    transform: "rotate(40deg)",
  })
  // .set(".prl-img", { clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)" })
  .to(
    ".prl-logo",
    {
      y: -500,
      duration: 1,
    },
    "<0.5"
  )
  .to(".nav", {
    duration: 2,
    opacity: 1,
    delay: -2,
  })
  .to(".brown-bg, .grey-bg, .white-bg", {
    display: "none",
    opacity: 0,
  })
  .to(
    ".hero__text",
    {
      duration: 1,
      y: 0,
      opacity: 1,
      transform: "rotate(0deg)",
    },
    "<"
  )
  .to(".hero", {
    position: "relative",
  });

gsap.to(".imagethree", {
  scrollTrigger: {
    trigger: ".imagethree",
    scrub: true,
    start: "top top",
    toggleActions: "play pause resume reset",
  },
  transform: "rotate(0deg)",
});

let loop = horizontalLoop(".image", { speed: 1, repeat: -1, paddingRight: 25 });
function setDirection(value) {
  if (loop.direction !== value) {
    gsap.to(loop, { timeScale: value, duration: 0.3, overwrite: true });
    loop.direction = value;
  }
}

Observer.create({
  target: window,
  type: "wheel,scroll,touch",
  onDown: () => setDirection(1),
  onUp: () => setDirection(-1),
});

function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
    totalWidth,
    curX,
    distanceToStart,
    distanceToLoop,
    item,
    i;
  gsap.set(items, {
    // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
          gsap.getProperty(el, "xPercent")
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });
  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      gsap.getProperty(items[length - 1], "scaleX") +
    (parseFloat(config.paddingRight) || 0);
  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add("label" + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }
  function toIndex(index, vars) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2 &&
      (index += index > curIndex ? -length : length); // always go in the shortest direction
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      // if we're wrapping the timeline's playhead, make the proper adjustments
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }
  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true); // pre-render for performance
  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }
  return tl;
}

const sectionThree = document.querySelector(".section-three");
const navItems = document.querySelectorAll(".navitem");
const arrow = document.querySelector(".arrow");

let options = {
  //root: document.querySelector(".nav__links"),
  thresholds: [0.6, 0.7, 0.8, 0.9, 1.0],
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navItems.forEach((link) => {
        link.classList.add("nav__link-black");
      });
      arrow.classList.add("arrow-black");
    } else {
      navItems.forEach((link) => {
        link.classList.remove("nav__link-black");
      });
      arrow.classList.remove("arrow-black");
    }
  });
}, options);

observer.observe(sectionThree);
