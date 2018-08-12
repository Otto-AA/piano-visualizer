const user = {
    "user_id": "____default_user____",
    "user_name": "____default_user____",
    "description": "It's a me, Mario!",
    "email": "user@example.com",
    "password": "myPass007"
}

const visualizationStandard = {
    background: {
        image: {
            link: 'http://via.placeholder.com/350x150',
            creator: 'Placeholder',
            creatorLink: 'https://placeholder.com'
        },
        gradient: [
            'blue',
            '#fff',
            'rgb(20, 20, 20)'
        ]
    },
    audioVisualization: {
        bar: {
            gradient: [
                'blue',
                '#fff',
                'rgb(20, 20, 20)'
            ],
            width: 10
        }
    },
    pianoVisualization: {
        key: {
            border: {
                white: true,
                black: false,
                color: 'aqua'
            },
            pressedColor: 'aquamarine'
        }
    },
    fontColor: 'pink'
};

module.exports.getTestData = () => {
    return {
        user: { ...user },
        visualizationStandard: { ...visualizationStandard }
    }
}