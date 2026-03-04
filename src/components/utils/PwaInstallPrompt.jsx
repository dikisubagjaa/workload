"use client";

import { useEffect, useState } from "react";
import { Modal, Button } from "antd";

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const isAlreadyInstalled = () => {
        if (typeof window === "undefined") return false;

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        const storageInstalled = localStorage.getItem("pwaInstalled") === "true";

        return isStandalone || storageInstalled;
    };

    const isIosSafari = () => {
        if (typeof window === "undefined") return false;
        const ua = window.navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
        return isIOS && isSafari;
    };

    const canShowPrompt = () => {
        if (isAlreadyInstalled()) return false;

        const lastShown = localStorage.getItem("installPromptLastShown");
        const now = new Date().getTime();
        if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
            localStorage.setItem("installPromptLastShown", now.toString());
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (isAlreadyInstalled()) return;

        const handler = (e) => {
            e.preventDefault();
            if (canShowPrompt()) {
                setDeferredPrompt(e);
                setShowModal(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    // iOS case
    useEffect(() => {
        if (isAlreadyInstalled()) return;
        if (isIosSafari() && canShowPrompt()) {
            setShowModal(true);
        }
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("✅ User accepted the install prompt");
            localStorage.setItem("pwaInstalled", "true");
        } else {
            console.log("❌ User dismissed the install prompt");
        }

        setDeferredPrompt(null);
        setShowModal(false);
    };

    // Detect if installed
    useEffect(() => {
        const handleAppInstalled = () => {
            console.log("🎉 App successfully installed!");
            localStorage.setItem("pwaInstalled", "true");
            setShowModal(false);
        };

        window.addEventListener("appinstalled", handleAppInstalled);
        return () => window.removeEventListener("appinstalled", handleAppInstalled);
    }, []);

    if (isAlreadyInstalled()) return null; 

    return (
        <Modal
            title="Install this app on your device"
            open={showModal}
            onCancel={() => setShowModal(false)}
            centered
            footer={
                !isIosSafari() && [
                    <Button key="cancel" onClick={() => setShowModal(false)}>
                        Later
                    </Button>,
                    <Button key="install" type="primary" onClick={handleInstall}>
                        Install
                    </Button>,
                ]
            }
        >
            {isIosSafari() ? (
                <h4 className="text-sm leading-relaxed">
                    On iPhone or iPad: tap <strong>Share</strong> →{" "}
                    <strong>Add to Home Screen</strong> to install this app.
                </h4>
            ) : (
                <h4 className="text-sm leading-relaxed">
                    Get faster access by installing this app directly on your home screen —
                    no need to open the browser again.
                </h4>
            )}
        </Modal>
    );
}
