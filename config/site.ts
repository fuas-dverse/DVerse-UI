export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: "DVerse",
    description:
        "A pair of collaborating bots called DVerse.",
    mainNav: [
        {
            title: "Chat",
            href: "/chat",
        }, {
            title: "Explore",
            href: "/",
        }, {
            title: "Contact",
            href: "/contact",
        }, {
            title: "Containers",
            href: "/containers",
        }, {
            title: "Privacy Statement",
            href: "/privacy",
        },
    ],
    links: {
        mastodon: "https://dverse.masto.host/home",
        github: "https://github.com/fuas-dverse/DVerse",
        docs: "https://fuas-dverse.github.io/",
    },
}