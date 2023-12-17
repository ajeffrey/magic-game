export const Touch = new class extends EventTarget {
  private ptrs: {[id: number]: PointerEvent};
  private ptrCount: number;

  constructor() {
    super();
    this.ptrs = {};
    this.ptrCount = 0;

    window.addEventListener('pointerdown', e => {
      this.ptrs[e.pointerId] = e;
      this.ptrCount += 1;
      console.log('ptrs+', this.ptrCount);
    });

    window.addEventListener('pointerup', e => {
      delete this.ptrs[e.pointerId];
      this.ptrCount -= 1;
      console.log('ptrs-', this.ptrCount);
    });

    window.addEventListener('pointercancel', e => {
      delete this.ptrs[e.pointerId];
      this.ptrCount -= 1;
      console.log('ptrs-', this.ptrCount);
    });

    window.addEventListener('pointermove', e => {
      if(this.ptrCount === 2) {
        const events = Object.values(this.ptrs);
        const [a, b] = e.pointerId == events[0].pointerId ? events : events.reverse();
        const oldDist = eventDistance(a, b);
        const newDist = eventDistance(e, b);
        
        this.dispatchEvent(new CustomEvent('pinchmove', {
          detail: newDist - oldDist
        }));
      }

      this.ptrs[e.pointerId] = e;
    });
  }
};

function eventDistance(a: PointerEvent, b: PointerEvent) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
