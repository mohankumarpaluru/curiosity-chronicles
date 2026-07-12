import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

// Inject Vercel Speed Insights after DOM loads
Body.afterDOMLoaded = `
  import("@vercel/speed-insights").then(({ injectSpeedInsights }) => {
    injectSpeedInsights();
  }).catch(() => {});
`

export default (() => Body) satisfies QuartzComponentConstructor
