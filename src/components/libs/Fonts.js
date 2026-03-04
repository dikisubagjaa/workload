import localFont from "next/font/local";

export const avenir = localFont({
    src: [
        {
            path: "../../../public/static/fonts/Avenir-Book.ttf",
            weight: "400",
            style: "normal",
        },
    ],
    variable: "--font-avenir",
});
