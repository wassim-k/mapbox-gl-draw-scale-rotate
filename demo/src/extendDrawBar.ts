import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Map } from 'mapbox-gl';

export interface ExtendDrawBarOptions {
  draw: MapboxDraw;
  buttons?: Array<ButtonOptions>;
  onAdd?: (map: Map) => HTMLElement;
  onRemove?: (map: Map) => void;
}

export interface ButtonOptions {
  classes?: Array<string>;
  on: string;
  action: EventListener;
  elButton?: HTMLButtonElement;
}

export class ExtendDrawBar {
  private buttons: Array<ButtonOptions>;
  private onAddOrig: (map: Map) => HTMLElement;
  private onRemoveOrig: (map: Map) => void;
  private elContainer!: HTMLElement;

  public constructor(opt: ExtendDrawBarOptions) {
    this.buttons = opt.buttons || [];
    this.onAddOrig = opt.draw.onAdd;
    this.onRemoveOrig = opt.draw.onRemove;
  }

  public onAdd(map: Map): HTMLElement {
    this.elContainer = this.onAddOrig(map);
    this.buttons.forEach((b) => {
      this.addButton(b);
    });
    return this.elContainer;
  }

  public onRemove(map: Map): void {
    this.buttons.forEach((b) => {
      this.removeButton(b);
    });
    this.onRemoveOrig(map);
  }

  private addButton(opt: ButtonOptions): void {
    const elButton = document.createElement('button');
    elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    elButton.addEventListener(opt.on, opt.action);
    this.elContainer.appendChild(elButton);
    opt.elButton = elButton;
  }

  public removeButton(opt: ButtonOptions): void {
    if (opt.elButton) {
      opt.elButton.removeEventListener(opt.on, opt.action);
      opt.elButton.remove();
    }
  }
}
