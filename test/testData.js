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

// TODO: Reference existing mp3, mid and pdf links here
song = {
    name: 'Test Song #1',
    user_id: user.user_id,
    type: 'cover',
    mp3Link: 'https://example.org/mp3',
    midLink: 'https://example.org/mid',
    pdfLink: 'https://example.org/pdf',
    visualizations: [
        {
            visualizationType: 'standard',
            visualizationId: undefined
        }        
    ]
};

module.exports.getTestData = () => {
    return {
        user: { ...user },
        visualizationStandard: { ...visualizationStandard },
        song: { ...song }
    };
};