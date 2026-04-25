// locations.js

// Central point of GH Raisoni Jalgaon
const SSBT_CENTER = [20.962134, 75.553502]; // Kept constant name for compatibility or renamed if I update app.js

const campusBuildings = [
    {
        id: 'main-building',
        name: 'Main Academic Building',
        category: 'academic',
        center: [20.962134, 75.553502],
        description: 'Primary academic block housing Engineering departments, Admin offices, and Principal cabin.',
        icon: 'school',
        image: 'assets/images/main_building.png'
    },
    {
        id: 'library',
        name: 'Central Library',
        category: 'library',
        center: [20.962200, 75.553400], // Slightly offset from main building center
        description: 'Extensive collection of books, journals, and digital resources for students.',
        icon: 'local_library',
        image: 'assets/images/library.png'
    },
    {
        id: 'boys-hostel',
        name: "Boys' Hostel",
        category: 'residential',
        center: [20.963021, 75.554597],
        description: 'On-campus residential facility for boys with 24/7 security and Wi-Fi.',
        icon: 'hotel',
        image: 'assets/images/hostel.png'
    },
    {
        id: 'girls-hostel',
        name: "Girls' Hostel",
        category: 'residential',
        center: [20.963100, 75.554650], // Slightly offset
        description: 'Safe and secure on-campus residential facility for girls.',
        icon: 'bed',
        image: 'assets/images/hostel.png'
    },
    {
        id: 'canteen',
        name: 'Campus Canteen',
        category: 'cafeteria',
        center: [20.961600, 75.553600],
        description: 'Round-the-clock cafeteria providing fresh meals and snacks.',
        icon: 'restaurant',
        image: 'assets/images/canteen.png'
    },
    {
        id: 'sports-ground',
        name: 'Main Sports Ground',
        category: 'recreation',
        center: [20.962500, 75.554300],
        description: 'Large open field for cricket, football, and athletics.',
        icon: 'sports_cricket',
        image: 'assets/images/sports_ground.png'
    },
    {
        id: 'main-gate',
        name: 'Main Entrance Gate',
        category: 'facility',
        center: [20.961900, 75.552300],
        description: 'Primary campus entrance from Pachora Road.',
        icon: 'door_front',
        image: 'assets/images/main_gate.png'
    },
    {
        id: 'gym',
        name: 'Gymnasium',
        category: 'recreation',
        center: [20.962800, 75.554400],
        description: 'Well-equipped fitness center for students and staff.',
        icon: 'fitness_center',
        image: 'assets/images/gym.png'
    },
    {
        id: 'parking',
        name: 'Visitor Parking',
        category: 'facility',
        center: [20.961800, 75.552800],
        description: 'Dedicated parking area for visitors and students.',
        icon: 'local_parking',
        image: 'assets/images/parking.png'
    }
];


const campusTimings = [
    { name: 'Academic Block', time: '09:00 AM - 5:30 PM', icon: 'school' },
    { name: 'Central Library', time: '08:00 AM - 8:00 PM', icon: 'local_library' },
    { name: 'Campus Canteen', time: '08:00 AM - 9:00 PM', icon: 'restaurant' },
    { name: 'Gymnasium', time: '06:00 AM - 09:00 PM', icon: 'fitness_center' },
    { name: 'Sports Ground', time: '06:00 AM - 7:00 PM', icon: 'sports_cricket' }
];
