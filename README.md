# Stencil Transform for AngularJS

This transform creates a compatible AngularJS (1.5+) component for a typed web component generated with Stencil.

### Usage:

First, find the `d.ts` file for your Stencil component, which will be in `dist/collections/components/YOUR-COMPONENT/your-component.d.ts`

Then, inside of this repo, run

```bash
npm run build your-component.d.ts yourNgModuleName output.js
```

* `your-component.d.ts` is the type file generated from stencil and found above,
* `yourNgModuleName` is the module used in your app (for example, `myApp`)
* `output.js` is the file where the angular code will be generated.

### Angular Usage

This transform works by creating a simple directive for your web component with the same name, and mappings for 
each prop and custom event.

This transform turns each prop into `prop-*` on the angular directive.

For example, with a web component that expects the following props:

```typescript
export declare class MyComponent {
    first: string;
    last: string;
    date: Date;
    onMyClick: EventEmitter;
    handleClick(e: any): void;
    render(): JSX.Element;
}
```

Your Angular directive will use the following form:

```html
<my-component prop-first="'Max'" prop-date="vm.currentDate" prop-on-my-click="vm.onClick($event)"></my-component>
```
