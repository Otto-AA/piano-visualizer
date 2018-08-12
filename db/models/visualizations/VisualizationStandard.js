const mongoose = require('mongoose');
const { databaseLogger } = require('../../../config/logger');


// TODO: Update/Set required properties
const visualizationSchema = new mongoose.Schema({
    background: {
        image: {
            link: String,
            creator: String,
            creatorLink: String
        },
        gradient: {
            type: [String],
            validate: (gradient) => gradient.length === 3
        }
    },
    audioVisualization: {
        bar: {
            gradient: {
                type: [String],
                validate: (gradient) => gradient.length === 3
            },
            width: {
                type: Number,
                min: 1
            }
        }
    },
    pianoVisualization: {
        key: {
            border: {
                white: Boolean,
                black: Boolean,
                color: String
            },
            pressedColor: String
        }
    },
    fontColor: String
}, {
    timestamps: true,
    strict: 'throw'
});


// var visualization = {
//     background: {
//         image: {
//             link: 'http',
//             creator: 'Yuumei',
//             creatorLink: 'yuumei.com'
//         },
//         gradient: [
//             'blue',
//             'red',
//             'green'
//         ]
//     },
//     audioVisualization: {
//         bar: {
//             gradient: [
//                 'blue',
//                 'red',
//                 'green'
//             ],
//             width: 10
//         }
//     },
//     pianoVisualization: {
//         key: {
//             border: {
//                 white: true,
//                 black: false,
//                 color: 'green'
//             },
//             pressedColor: 'blue'
//         }
//     },
//     fontColor: 'white'
// }

const VisualizationStandard = mongoose.model('VisualizationStandard', visualizationSchema);

module.exports = VisualizationStandard;