import { Service } from "./booking-types";

export const SERVICES: Service[] = [
    // In-Shop Services
    {
        id: 'haircut',
        name: 'Haircut',
        duration: '45 mins',
        price: '£25',
        category: 'inShop',
        description: 'Any style haircut with cut-throat razor hairline shape-up. Includes skin fade with foil shaver.'
    },
    {
        id: 'haircut_beard',
        name: 'Haircut & Beard',
        duration: '1 hour',
        price: '£30',
        category: 'inShop',
        description: 'Any style haircut and beard. Includes skin fade haircut with foil shaver and shape-up. Cut-throat razor used for beard shape-up and hairline shape-up.'
    },
    {
        id: 'beard',
        name: 'Beard',
        duration: '30 mins',
        price: '£15',
        category: 'inShop',
        description: 'Any beard style with beard shape-up and beard line-up. Includes foil shaver and cut-throat razor.'
    },
    // Home Services
    {
        id: 'home_haircut',
        name: 'Home Haircut',
        duration: '1 hour',
        price: '£60',
        category: 'home',
        description: 'Any style haircut with cut-throat razor hairline shape-up. Includes skin fade with foil shaver.'
    },
    {
        id: 'home_haircut_beard',
        name: 'Home Haircut & Beard',
        duration: '1 hour 15 mins',
        price: '£70',
        category: 'home',
        description: 'Any style haircut and beard. Includes skin fade haircut with foil shaver and shape-up. Cut-throat razor used for beard shape-up and hairline shape-up.'
    }
];