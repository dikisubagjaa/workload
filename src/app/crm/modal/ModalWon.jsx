import { Button, Modal } from 'antd';

export default function ModalWon({ modalWon, setModalWon }) {
    return (
        <>
            <Modal
                open={modalWon}
                onCancel={() => setModalWon(false)}
                footer={null}
                width={800}
            >
                <div className="text-sm">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veniam neque ratione ipsum, cumque odio repudiandae quisquam. Distinctio unde odit maxime in numquam nam debitis, natus laudantium minima reiciendis cum quis nostrum quibusdam facere corrupti fuga placeat cumque eveniet iste! Vitae, ad expedita veniam architecto magnam veritatis ullam quam porro iste, fugiat doloribus nobis quas dolor error atque, blanditiis maiores fugit? Numquam reprehenderit iste repellat iusto, nesciunt veritatis! Sit modi aliquid saepe inventore harum, placeat accusamus deserunt autem voluptates eligendi iste magni corrupti repellendus tempora vero? Vitae ipsa sit voluptate veritatis harum, aliquid rem totam similique temporibus corporis culpa eius alias!</p>
                    <br />
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est illo voluptate doloremque. Voluptas reiciendis dolorum adipisci temporibus, debitis, officia voluptate quas deserunt velit quidem porro voluptatibus hic! Numquam, dolore vel? Fuga ducimus suscipit libero distinctio. Voluptatibus quasi in a officiis, doloribus possimus illo magni labore similique omnis officia quos voluptas.</p>
                    <br />
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est illo voluptate doloremque. Voluptas reiciendis dolorum adipisci temporibus, debitis, officia voluptate quas deserunt velit quidem porro voluptatibus hic! Numquam, dolore vel? Fuga ducimus suscipit libero distinctio. Voluptatibus quasi in a officiis, doloribus possimus illo magni labore similique omnis officia quos voluptas.</p>
                    <br />
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est illo voluptate doloremque. Voluptas reiciendis dolorum adipisci temporibus, debitis, officia voluptate quas deserunt velit quidem porro voluptatibus hic! Numquam, dolore vel? Fuga ducimus suscipit libero distinctio. Voluptatibus quasi in a officiis, doloribus possimus illo magni labore similique omnis officia quos voluptas.</p>
                </div>

                <div className="flex justify-center gap-2 mt-7">
                    <Button shape='round' className="btn-blue px-5">Yes</Button>
                    <Button shape='round' variant='solid' color='danger' className='px-5' onClick={() => setModalWon(false)}>No</Button>
                </div>
            </Modal >
        </>
    )
}
