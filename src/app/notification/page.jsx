"use client";

import { useState } from "react";
import { Button, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";

export default function Page() {
    const [expanded, setExpanded] = useState({});

    const notifications = [
        {
            id: 1,
            title: "System Maintenance Notice",
            content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae ex non turpis blandit facilisis. 
            Donec aliquet eros sed augue interdum, nec suscipit justo dictum. Maecenas nec pulvinar purus. 
            Ut in malesuada elit. Proin sed odio a justo volutpat hendrerit sit amet nec velit.</p>
            <p>We will perform <strong>system maintenance</strong> on <em>Saturday, 00:00–04:00 AM</em>. 
            Sed sagittis, massa non hendrerit congue, justo orci malesuada ante, in dictum velit ligula sed sem.</p>
            <ul>
                <li>Services may be temporarily unavailable</li>
                <li>Data integrity will be preserved during the process</li>
                <li>Contact support if you encounter any unexpected behavior</li>
            </ul>
            <p>Thank you for your patience during this maintenance window. Lorem ipsum dolor sit amet consectetur, 
            adipisicing elit. Repudiandae, autem!</p>
        `,
        },
        {
            id: 2,
            title: "New Feature Update",
            content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
            Veniam, dolore architecto. Nulla aliquid, rerum laudantium odit, molestias, 
            officiis alias fugit tempora voluptatibus corporis repudiandae?</p>
            <p>Enable it by navigating to:</p>
            <ol>
                <li>Account Settings</li>
                <li>Display Preferences</li>
                <li>Toggle <strong>Dark Mode</strong> ON</li>
            </ol>
            <p>Aliquam erat volutpat. Nam viverra ex ut lorem interdum, quis faucibus leo rhoncus. 
            Pellentesque in dui nec mi lacinia condimentum. Curabitur sodales, massa sed viverra pretium, 
            libero felis porta metus, id congue purus magna vel mi.</p>
        `,
        },
        {
            id: 3,
            title: "Security Reminder",
            content: `
            <p>Your account security is our top priority. Here are some quick reminders to help you stay protected:</p>
            <ul>
                <li>Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.</li>
                <li>Change your password every 3 months.</li>
                <li>Never reuse passwords across different accounts.</li>
            </ul>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
            Repellat excepturi possimus dicta voluptate quas, ipsa sed error consequatur, 
            architecto tempora quidem dignissimos ullam. Cumque amet pariatur eveniet doloribus 
            laudantium placeat.</p>
            <p>Stay safe online and thank you for being part of our secure community.</p>
        `,
        },
        {
            id: 4,
            title: "Message from Admin",
            content: `
            <p>We’ve completely redesigned our dashboard to make your experience faster and more intuitive. 
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis in libero dignissim, 
            fermentum lorem sit amet, pulvinar ante. Mauris facilisis, enim in efficitur sodales, 
            ante justo aliquet lacus, nec feugiat justo felis vel neque.</p>
            <p>Highlights include:</p>
            <ul>
                <li>Cleaner navigation menu with collapsible sections</li>
                <li>Optimized loading performance</li>
                <li>Improved charts and analytics visuals</li>
                <li>Enhanced accessibility features</li>
            </ul>
            <p>If you experience any issues, feel free to reach out to our support team.</p>
        `,
        },
        {
            id: 5,
            title: "Survey Invitation",
            content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Suspendisse potenti. Integer iaculis erat vel ante sollicitudin, 
            non posuere nulla ultricies. Curabitur a congue nulla. 
            Etiam sed magna justo. Sed euismod eros id metus posuere, vel pretium nibh luctus.</p>
            <p>Your insights help us improve future updates and features. 
            Quisque at congue eros, a pretium neque. Donec id neque purus. 
            Cras euismod sapien eu sem congue, ut dictum justo laoreet.</p>
            <p><strong>Click “Read More”</strong> to view survey details and help us shape the next generation of our platform.</p>
        `,
        },
    ];


    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className="container py-10">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-bold fc-base mb-5 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBell} size="lg" /> Notifications
                </h2>

                {notifications.map((item) => (
                    <Card
                        key={item.id}
                        className="shadow-md mb-5"
                        classNames={{ body: "py-3" }}
                    >
                        <h3 className="text-base font-semibold mb-2">
                            {item.title}
                        </h3>
                        <hr className="my-2" />

                        <div
                            className={`message-area ${expanded[item.id]
                                ? "active"
                                : null
                                }`}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />

                        <div className="flex justify-center mt-3">
                            <Button
                                color="default"
                                variant="outlined"
                                onClick={() => toggleExpand(item.id)}
                            >
                                {expanded[item.id] ? "Hide" : "Read More"}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
