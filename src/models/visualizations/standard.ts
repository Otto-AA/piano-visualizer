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
  pianoVisualization: {
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

const visualizationStandardSchema = new mongoose.Schema({
  background: {
    image: {
      link: { type: String, required: true },
      creator: { type: String, required: true },
      creatorLink: { type: String, required: true },
    },
    gradient: { ...threeColorGradient, required: true }
  },
  audioVisualization: {
    bar: {
      gradient: { ...threeColorGradient, required: true },
      width: {
        type: Number,
        min: 1,
        required: true
      }
    }
  },
  pianoVisualization: {
    key: {
      border: {
        white: { type: Boolean, required: true },
        black: { type: Boolean, required: true },
        color: { type: String, required: true }
      },
      pressedColor: { type: String, required: true }
    }
  },
  fontColor: { type: String, required: true }
}, { timestamps: true, strict: true });

const VisualizationStandard = mongoose.model("VisualizationStandard", visualizationStandardSchema);
export default VisualizationStandard;
