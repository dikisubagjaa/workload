// src/components/task/subtask/attachment/AttachmentThumb.jsx
"use client";

import Image from "next/image";
import { Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function AttachmentThumb({
    isImage,
    hrefView,
    hrefOriginal,
    extension,
    displayName,
    onOpenImage,
}) {
    return isImage && hrefView ? (
        <button type="button" onClick={onOpenImage} aria-label="View">
            <div className="relative">
                <Image
                    src={hrefView}
                    width={100}
                    height={100}
                    alt={displayName || "File Preview"}
                    className="w-14 h-10 object-cover rounded-sm"
                    unoptimized
                />
                <Tooltip title="Approve" placement="bottom">
                    <button className="btn-approve active">
                        <FontAwesomeIcon icon={faStar} size="30" />
                    </button>
                </Tooltip>
            </div>
        </button>
    ) : (
        <a href={hrefOriginal || undefined} target="_self" rel="noopener noreferrer">
            <div className="bg-[#F5F5F5] w-14 h-10 object-cover rounded flex items-center justify-center relative">
                <h6 className="fc-base font-bold">{extension}</h6>
                <Tooltip title="Approve" placement="bottom">
                    <button className="btn-approve active">
                        <FontAwesomeIcon icon={faStar} size="30" />
                    </button>
                </Tooltip>
            </div>
        </a>
    );
}
