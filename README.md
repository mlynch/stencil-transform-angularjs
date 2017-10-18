# Stencil Transform for AngularJS

This transform creates a compatible AngularJS (1.5+) component for a typed web component generated with Stencil.

### Usage:

First, find the `d.ts` file for your Stencil component, which will be in `dist/collections/components/YOUR-COMPONENT/your-component.d.ts`

Then, inside of this repo, run

```bash
npm run build your-component.d.ts yourNgModuleName output.js
```

Where `your-component.d.ts` is the file found above, `yourNgModuleName` is the module used in your app (for example, `myApp`), and `output.js` is
the file where the angular code will be generated.
