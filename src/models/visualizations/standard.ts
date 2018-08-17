import mongoose from "mongoose";

export type VisualizationStandardModel = mongoose.Document & {
  background: {
    image: {
      link: string,
      creator: string,
      creatorLink: string
    },
    gradient: string[]
  },
  audioVisualization: {
    bar: {
      gradient: string[],
      width: number
    }
  },
  pinaoVisualization: {
    key: {
      border: {
        white: boolean,
        black: boolean,
        color: string
      },
      pressedColor: string
    }
  },
  fontColor: string
};

// TODO: Update this function
const isColorString = (str: string) => true;

const threeColorGradient = {
  type: [String],
  validate: (gradient: string[]) => gradient.length === 3 && gradient.every(isColorString)
};

const visualizationStandardSchema = new mongoose.Schema({background: {
  image: {
    link: String,
    creator: String,
    creatorLink: String
    },
    gradient: threeColorGradient
  },
  audioVisualization: {
    bar: {
      gradient: threeColorGradient,
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
}, { timestamps: true, strict: true });

const VisualizationStandard = mongoose.model("VisualizationStandard", visualizationStandardSchema);
export default VisualizationStandard;
