"use client"
import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Form, Radio, Tag } from "antd";
import Link from "next/link";

const questions = [
    "I am proud of the contributions and achievements I made this year.",
    "I met or exceeded the goals and targets set for me.",
    "I have improved my skills and performance compared to last year.",
    "I handled challenges effectively and found solutions when needed.",
    "I continuously seek opportunities to improve my work.",
    "I collaborated effectively with my team and other departments.",
    "I managed my time and priorities well to meet deadlines.",
    "I had access to the tools, resources, and support needed to perform my job well.",
    "I am clear on my goals and objectives for the coming year.",
    "I am satisfied with my role, workload, and the overall work environment.",
];

const options = [
    { value: 1, color: "radio-1" },
    { value: 2, color: "radio-2" },
    { value: 3, color: "radio-3" },
    { value: 4, color: "radio-4" },
    { value: 5, color: "radio-5" },
];

export default function MainContent() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log("Form result:", values);
    };

    return (
        <section className="container py-10">
            <Card className="card-box">
                {/* header */}
                <h1 className="text-xl font-semibold mb-3">Annual Review</h1>
                <div className="flex justify-between flex-col sm:flex-row items-start gap-5 mb-5">
                    <div className="w-full sm:w-1/2">
                        <div className="mb-4">
                            <h3 className="text-base mb-1">Thanks for completing your performance review!</h3>
                            <h3 className="text-sm">We’ve received your responses and they’ll be reviewed by your manager and HR. You’ll hear from us once the process is complete.</h3>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto border border-yellow-300 rounded-lg p-3 sm:p-5">
                        <div className="flex justify-between gap-3 sm:gap-10 mb-3">
                            <div className="text-sm">Status:</div>
                            <div className="text-sm">
                                <Tag color="yellow" variant="outlined" className="rounded-full px-3">Received</Tag>
                            </div>
                        </div>
                        <div className="flex justify-between gap-3 sm:gap-10">
                            <div className="text-sm">Submit before:</div>
                            <div className="text-sm font-bold">12 December 2025</div>
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    )
}
