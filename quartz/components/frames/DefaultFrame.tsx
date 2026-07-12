import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()
import ShareLinkConstructor from "../ShareLink"
const ShareLink = ShareLinkConstructor()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer: Footer,
  }: PageFrameProps) {
    return (
      <>
        <div class="left sidebar">
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <div class="center">
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => {
                if (BodyComponent.name === "ArticleTitle" || BodyComponent.displayName === "ArticleTitle") {
                  return (
                    <div class="article-title-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <BodyComponent {...componentData} />
                      <ShareLink {...componentData} />
                    </div>
                  )
                }
                return <BodyComponent {...componentData} />
              })}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>
        <div class="right sidebar">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <Footer {...componentData} />
      </>
    )
  },
  css: `
.article-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.article-title-row .article-title {
  margin-top: 0;
}
` + (ShareLink.css ?? ""),
}
