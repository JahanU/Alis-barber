import { Service } from "./booking-types";

export const SERVICES: Service[] = [
    {
        id: 'eyebrow-shaping',
        name: 'Eyebrow shaping',
        duration: '10 mins',
        price: 5,
        category: 'inShop',
        description: 'Quick eyebrow shaping to define and tidy up brows.'
    },
    {
        id: 'nose-waxing-ears',
        name: 'Nose waxing and ears',
        duration: '10 mins',
        price: 5,
        category: 'inShop',
        description: 'Nose and ear waxing for a clean and comfortable finish.'
    },
    {
        id: 'buzz-cut',
        name: 'Buzz cut',
        duration: '20 mins',
        price: 12,
        category: 'inShop',
        description: 'Low-maintenance buzz cut for a clean, even all-over style.'
    },
    {
        id: 'beard-trim-shape-up',
        name: 'Beard trim & shape up',
        duration: '20 mins',
        price: 12,
        category: 'inShop',
        description: 'Beard trimming with shape-up for crisp edges.'
    },
    {
        id: 'kids-normal-cut',
        name: 'Kids normal cut',
        duration: '20 mins',
        price: 13,
        category: 'inShop',
        description: 'Basic children’s haircut for a quick and tidy trim.'
    },
    {
        id: 'normal-haircut',
        name: 'Normal Haircut',
        duration: '30 mins',
        price: 15,
        category: 'inShop',
        description: 'Standard haircut to your preference for a neat and tidy finish.'
    },
    {
        id: 'kids-skin-fade',
        name: 'Kids skin fade',
        duration: '30 mins',
        price: 15,
        category: 'inShop',
        description: 'Skin fade tailored for kids, offering a stylish and age-appropriate cut.'
    },
    {
        id: 'hot-towel-shave',
        name: 'Hot towel shave',
        duration: '30 mins',
        price: 15,
        category: 'inShop',
        description: 'Traditional hot towel shave for a smooth and relaxing grooming experience.'
    },
    {
        id: 'skin-fade',
        name: 'Skin fade',
        duration: '30 mins',
        price: 20,
        category: 'inShop',
        description: 'Classic skin fade haircut with precision fading around the sides and back.'
    },
    {
        id: 'head-shave-beard-trim',
        name: 'Head shave & beard trim',
        duration: '30 mins',
        price: 24,
        category: 'inShop',
        description: 'Full head shave combined with beard trim for a sharp finish.'
    },
    {
        id: 'beard-trim-colour',
        name: 'Beard trim & colour',
        duration: '30 mins',
        price: 25,
        category: 'inShop',
        description: 'Beard trim with optional colouring for added style.'
    },
    {
        id: 'normal-haircut-beard',
        name: 'Normal Haircut & beard',
        duration: '30 mins',
        price: 27,
        category: 'inShop',
        description: 'Standard haircut plus beard grooming for a complete fresh look.'
    },
    {
        id: 'skin-fade-beard',
        name: 'Skin fade & beard',
        duration: '45 mins',
        price: 30,
        category: 'inShop',
        description: 'A skin fade haircut combined with beard grooming for a sharp, clean look.'
    },
    {
        id: 'full-service',
        name: 'Full service',
        duration: '60 mins',
        price: 35,
        category: 'inShop',
        description: 'Complete grooming session including haircut and beard services.'
    },
    {
        id: 'home_haircut',
        name: 'Home Haircut',
        duration: '1 hour',
        price: 40,
        category: 'home',
        description: 'Any style haircut with cut-throat razor hairline shape-up. Includes skin fade with foil shaver.'
    },
    {
        id: 'home_haircut_beard',
        name: 'Home Haircut & Beard',
        duration: '1 hour 15 mins',
        price: 55,
        category: 'home',
        description: 'Any style haircut and beard. Includes skin fade haircut with foil shaver and shape-up. Cut-throat razor used for beard shape-up and hairline shape-up.'
    }
];
