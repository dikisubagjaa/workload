// app/(auth)/login/page.jsx
import Image from 'next/image';
import Link from 'next/link';
import ButtonGoogle from '@/components/button/ButtonGoogle';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from 'antd';
import Time from '@/components/utils/Time';
import { asset } from '@/utils/url';
import PwaInstallPrompt from '@/components/utils/PwaInstallPrompt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
dayjs.tz.setDefault(defaultTimezone);

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

export const metadata = {
    title: 'VP Workload',
    description: 'Connecting with VP-Digital',
    manifest: '/manifest.json',
    keywords: ['vp-workload'],
    icons: {
        icon: [
            { url: '/static/icon-pwa/icon-192x192.png' }
        ],
        apple: [
            { url: '/static/icon-pwa/icon-192x192.png' }
        ]
    },
    other: {
        'color-scheme': 'light',
        'theme-color': '#ffffff',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': 'VP Workload',
        'mobile-web-app-capable': 'yes'
    }
}

export default async function Login() {
	const session = await getServerSession();
	if (session?.user) redirect('/dashboard');

	return (
		<>
			<PwaInstallPrompt />
			<Link href="/" className="hidden sm:block fixed z-10 top-5 left-5">
				<h1>
					<Image
						priority
						src={asset("static/images/logo.png")}
						width={300}
						height={300}
						alt="Logo"
						className="w-36"
					/>
				</h1>
			</Link>

			<section className="bg-login">
				<div className="container relative">
					<div className="flex flex-col items-center justify-center min-h-screen">
						<Link href="/" className="block sm:hidden mb-5">
							<h1>
								<Image
									priority
									src={asset("static/images/logo.png")}
									width={300}
									height={300}
									alt="Logo"
									className="w-36"
								/>
							</h1>
						</Link>

						<Card
							variant="outlined"
							style={{ width: 350 }}
							className="py-10 px-5 mb-6 shadow-xl rounded-2xl"
							classNames={{ body: 'p-0' }}
						>
							<div className="text-center">
								<h2 className="text-3xl fc-blue mb-1">VP WORKLOAD</h2>
								<h3 className="text-gray-500">PT. Alpha Guna Media</h3>
								<hr className="my-5" />

								<h3 className="mb-6 text-sm text-gray-500">
									Hello, please enter your details to sign in to your account
								</h3>

								<div className="flex justify-center mb-6">
									<ButtonGoogle />
								</div>

								<div className="text-center text-gray-500" suppressHydrationWarning>
									<div className="mb-1">
										<Time /> {/* aman: SSR akan render null, client update tiap detik */}
									</div>
									<h4 className="text-xs mb-1">Attendance Start From 06:00 - 09:30 WIB</h4>
									<h4 className="text-xs mb-1">My IP Address: 182.253.126.6</h4>
									{/* <h4 className="text-xs mb-1">Connecting with VP-Digital</h4> */}
								</div>
							</div>
						</Card>

						<div className="text-center">
							<h4 className="text-xs text-gray-500">Copyright VP Digital 2025</h4>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
