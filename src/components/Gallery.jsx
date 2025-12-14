import React from 'react';
import './Gallery.css';

const GALLERY_ITEMS = [
    {
        id: 1,
        image: '/classic-fade.png',
        title: 'Classic Fade',
        description: 'Sharp, clean lines with a smooth fade transition'
    },
    {
        id: 2,
        image: '/beard-trim.png',
        title: 'Beard Trim & Shape',
        description: 'Professional grooming for the perfect look'
    },
    {
        id: 3,
        image: '/modern-cut.png',
        title: 'Modern Textured Cut',
        description: 'Contemporary styling with volume and texture'
    },
    {
        id: 4,
        image: '/pompadour-style.png',
        title: 'Pompadour Style',
        description: 'Classic gentleman\'s cut with high volume'
    },
    {
        id: 5,
        image: '/hot-towel-shave.png',
        title: 'Hot Towel Shave',
        description: 'Traditional luxury shaving experience'
    },
    {
        id: 6,
        image: '/barber-work.png',
        title: 'Expert Craftsmanship',
        description: 'Premium barbering service in our shop'
    },
];

const Gallery = () => {
    return (
        <section className="gallery">
            <div className="container">
                <div className="gallery-header">
                    <h2>Our Work</h2>
                    <p>See the quality and precision of our barbering services</p>
                </div>

                <div className="gallery-grid">
                    {GALLERY_ITEMS.map((item, index) => (
                        <div
                            key={item.id}
                            className="gallery-item"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="gallery-image-wrapper">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="gallery-image"
                                />
                                <div className="gallery-overlay">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
