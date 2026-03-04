"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function QuillEditor({ value = "", onChange, placeholder }) {
    const [content, setContent] = useState(value);

    useEffect(() => {
        setContent(value || "");
    }, [value]);

    const handleChange = (val) => {
        setContent(val);
        if (onChange) onChange(val);
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "link",
        "image",
    ];

    return (
        <ReactQuill
            theme="snow"
            value={content}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            className="bg-white rounded-md"
        />
    );
}
