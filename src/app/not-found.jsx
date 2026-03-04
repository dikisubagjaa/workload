import { Result } from 'antd';
import Link from 'next/link';

export default function notFound() {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            className='pt-40'
            extra={
                <Link href="#" className='btn-outline-blue px-5 py-2 rounded-lg'>Back Home</Link>
            }
        />
    )
}
