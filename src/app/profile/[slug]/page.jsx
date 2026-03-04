// src/app/profile/[slug]/page.jsx
import MainContent from "../MainContent";

export default function ProfileSlugPage({ params }) {
    const { slug } = params; // slug bisa uuid atau user_id
    return <MainContent slug={slug} />;
}
