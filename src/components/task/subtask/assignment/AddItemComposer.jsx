// src/components/task/subtask/assignment/AddItemComposer.jsx
"use client";

import { Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function AddItemComposer({
    drafts = [], // array of placeholder strings (mis. "Item 1", ...)
    onAddDraft, // () => void   (tambah 1 draft kosong)
    onRemoveDraft, // (index) => void
    onSubmitDraft, // (title: string) => void
    placeholder = "Please input Item",
}) {
    return (
        <div className="sm:ps-2">
            <ul className="flex flex-col gap-5 mb-5">
                {drafts.map((_, index) => (
                    <li key={index}>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => onRemoveDraft?.(index)}>
                                <div className="custom-icon">
                                    <FontAwesomeIcon icon={faXmark} />
                                </div>
                            </button>
                            <Input
                                placeholder={placeholder}
                                variant="underlined"
                                allowClear
                                onPressEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const value = e.target.value.trim();
                                    if (value) {
                                        onSubmitDraft?.(value);
                                        e.target.value = "";
                                    }
                                }}
                            />
                        </div>
                    </li>
                ))}

                <li>
                    <button type="button" className="text-gray-400 flex items-center gap-4" onClick={onAddDraft}>
                        <div className="custom-icon">
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <span className="text-sm">Add item</span>
                    </button>
                </li>
            </ul>
        </div>
    );
}
